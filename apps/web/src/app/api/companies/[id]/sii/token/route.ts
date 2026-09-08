import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { document_id, document_type = '33' } = body;

    if (!document_id) {
      return errorResponse('document_id is required', 400);
    }

    const company = await query(
      `SELECT sii_username, sii_password, sii_test_mode, name FROM companies WHERE id = $1`,
      [companyId]
    );

    if (!company.rows.length) {
      return errorResponse('Company not found', 404);
    }

    const credentials = company.rows[0];

    if (!credentials.sii_username || !credentials.sii_password) {
      return errorResponse('SII credentials not configured. Please configure SII settings in company settings.', 400);
    }

    const token = generateSIIToken(credentials.sii_username, credentials.sii_password, credentials.sii_test_mode);

    return successResponse({
      token,
      test_mode: credentials.sii_test_mode,
      expires_in: 3600,
    });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

function generateSIIToken(username: string, password: string, testMode: boolean = true): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = crypto.randomBytes(16).toString('hex');
  const baseString = `${username}${password}${timestamp}${random}`;
  
  if (testMode) {
    const testPayload = Buffer.from(JSON.stringify({
      user: username,
      timestamp,
      random,
      test: true,
    })).toString('base64');
    
    return `TEST_${crypto.createHash('sha256').update(testPayload).digest('hex').substring(0, 32)}`;
  }

  const hash = crypto.createHash('sha256').update(baseString).digest('hex');
  return hash;
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const company = await query(
      `SELECT sii_username, sii_test_mode FROM companies WHERE id = $1`,
      [companyId]
    );

    if (!company.rows.length) {
      return errorResponse('Company not found', 404);
    }

    const config = company.rows[0];

    return successResponse({
      configured: !!config.sii_username,
      test_mode: config.sii_test_mode,
      username: config.sii_username ? `${config.sii_username.substring(0, 3)}***` : null,
    });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
