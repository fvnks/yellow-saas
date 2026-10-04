import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { storeCertificate, getCertificateForSigning, extractCertInfo, CertificateInfo } from '@/lib/sii-certificate';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT sii_cert_subject, sii_cert_issuer, sii_cert_not_before, sii_cert_not_after,
              sii_cert_password, sii_test_mode
       FROM companies WHERE id = $1`,
      [companyId]
    );

    if (!result.rows.length) {
      return errorResponse('Company not found', 404);
    }

    const config = result.rows[0];
    const hasCert = !!config.sii_cert_subject;

    let certInfo: CertificateInfo | null = null;
    if (hasCert && config.sii_cert_not_before && config.sii_cert_not_after) {
      certInfo = {
        subject: config.sii_cert_subject,
        issuer: config.sii_cert_issuer,
        validFrom: new Date(config.sii_cert_not_before),
        validTo: new Date(config.sii_cert_not_after),
        serialNumber: '',
        fingerprint: '',
        rut: config.sii_cert_subject.match(/([0-9]{7,8}-[0-9kK])/i)?.[1] || '',
        isValid: new Date() >= new Date(config.sii_cert_not_before) && new Date() <= new Date(config.sii_cert_not_after),
        daysUntilExpiry: Math.ceil((new Date(config.sii_cert_not_after).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      };
    }

    return successResponse({
      has_certificate: hasCert,
      test_mode: config.sii_test_mode,
      cert_info: certInfo,
    });
  } catch (err) {
    console.error('Certificate GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle .p12 file upload
      const formData = await request.formData();
      const file = formData.get('certificate') as File;
      const password = formData.get('password') as string;

      if (!file) {
        return errorResponse('Certificate file is required', 400);
      }
      if (!password) {
        return errorResponse('Certificate password is required', 400);
      }

      // Read file as base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const p12Base64 = buffer.toString('base64');

      // Store certificate (parses PKCS#12 internally)
      const certInfo = await storeCertificate(companyId, p12Base64, password);

      return successResponse({
        message: 'Certificate uploaded and stored successfully',
        cert_info: certInfo,
      });
    } else {
      // Handle JSON (base64 encoded certificate)
      const body = await request.json();
      const { certificate_base64, password } = body;

      if (!certificate_base64 || !password) {
        return errorResponse('certificate_base64 and password are required', 400);
      }

      const certInfo = await storeCertificate(companyId, certificate_base64, password);

      return successResponse({
        message: 'Certificate stored successfully',
        cert_info: certInfo,
      });
    }
  } catch (err) {
    console.error('Certificate POST error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    await query(
      `UPDATE companies SET
        sii_cert_data = NULL,
        sii_cert_password = NULL,
        sii_cert_subject = NULL,
        sii_cert_issuer = NULL,
        sii_cert_not_before = NULL,
        sii_cert_not_after = NULL,
        updated_at = NOW()
      WHERE id = $1`,
      [companyId]
    );

    return successResponse({ message: 'Certificate removed successfully' });
  } catch (err) {
    console.error('Certificate DELETE error:', err);
    return errorResponse('Internal server error', 500);
  }
}