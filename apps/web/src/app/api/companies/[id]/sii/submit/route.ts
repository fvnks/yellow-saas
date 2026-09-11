import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

// STUB: Simulated SII integration. Replace with real SII SOAP/API call when digital certificate is configured.
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
      `SELECT sii_username, sii_password, sii_test_mode, name, tax_id FROM companies WHERE id = $1`,
      [companyId]
    );

    if (!company.rows.length) {
      return errorResponse('Company not found', 404);
    }

    const credentials = company.rows[0];

    if (!credentials.sii_username || !credentials.sii_password) {
      return errorResponse('SII credentials not configured', 400);
    }

    const doc = await query(
      `SELECT id, invoice_number, customer_id, invoice_date, subtotal, tax_amount, total_amount, sii_status FROM invoices WHERE id = $1 AND company_id = $2`,
      [document_id, companyId]
    );

    if (doc.rows.length === 0) {
      return errorResponse('Invoice not found', 404);
    }

    const invoice = doc.rows[0];

    if (invoice.sii_status === 'accepted') {
      return successResponse({ message: 'DTE already accepted by SII', status: invoice.sii_status });
    }

    const response = {
      success: true,
      simulated: true,
      track_id: `SII-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      status: 'pending',
      message: 'DTE sent to SII for processing (simulated — no real submission made)',
    };

    await query(
      `UPDATE invoices SET 
        sii_status = $1,
        sii_track_id = $2,
        sii_sent_at = NOW(),
        sii_response_at = NOW(),
        updated_at = NOW()
       WHERE id = $3 AND company_id = $4`,
      [response.status, response.track_id, document_id, companyId]
    );

    await query(
      `UPDATE companies SET sii_last_submission_at = NOW() WHERE id = $1`,
      [companyId]
    );

    return successResponse(response);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

// STUB: Simulated SII integration. Replace with real SII SOAP/API call when digital certificate is configured.
export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const documentId = url.searchParams.get('document_id');

    if (documentId) {
      const doc = await query(
        `SELECT id, invoice_number, sii_status, sii_track_id, sii_sent_at, sii_response_at, sii_error 
         FROM invoices WHERE id = $1 AND company_id = $2`,
        [documentId, companyId]
      );
      return successResponse(doc.rows[0]);
    }

    const result = await query(
      `SELECT id, invoice_number, sii_status, sii_sent_at, sii_error 
       FROM invoices WHERE company_id = $1 
       ORDER BY sii_sent_at DESC LIMIT 10`,
      [companyId]
    );

    return successResponse(result.rows);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
