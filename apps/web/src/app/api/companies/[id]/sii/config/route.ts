import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const company = await query(
      `SELECT sii_username, sii_test_mode, sii_cert_path, sii_quota_enabled, sii_quota_limit, sii_last_submission_at 
       FROM companies WHERE id = $1`,
      [companyId]
    );

    if (!company.rows.length) {
      return errorResponse('Company not found', 404);
    }

    const config = company.rows[0];

    return successResponse({
      username: config.sii_username ? `${config.sii_username.substring(0, 3)}***` : null,
      test_mode: config.sii_test_mode,
      has_certificate: !!config.sii_cert_path,
      quota_enabled: config.sii_quota_enabled,
      quota_limit: config.sii_quota_limit,
      last_submission: config.sii_last_submission_at,
    });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { 
      sii_username, 
      sii_password, 
      sii_test_mode, 
      sii_cert_path, 
      sii_cert_password,
      sii_quota_enabled,
      sii_quota_limit,
      sii_document_type_default,
    } = body;

    const result = await query(
      `UPDATE companies SET
        sii_username = COALESCE($2, sii_username),
        sii_password = COALESCE($3, sii_password),
        sii_test_mode = COALESCE($4, sii_test_mode),
        sii_cert_path = COALESCE($5, sii_cert_path),
        sii_cert_password = COALESCE($6, sii_cert_password),
        sii_quota_enabled = COALESCE($7, sii_quota_enabled),
        sii_quota_limit = COALESCE($8, sii_quota_limit),
        sii_document_type_default = COALESCE($9, sii_document_type_default),
        updated_at = NOW()
       WHERE id = $1
       RETURNING id, sii_username, sii_test_mode, sii_quota_enabled, sii_quota_limit`,
      [
        companyId,
        sii_username,
        sii_password,
        sii_test_mode,
        sii_cert_path,
        sii_cert_password,
        sii_quota_enabled,
        sii_quota_limit,
        sii_document_type_default,
      ]
    );

    if (!result.rows.length) {
      return errorResponse('Company not found', 404);
    }

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
