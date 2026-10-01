import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('No autorizado', 401);

    const result = await query(
      `SELECT * FROM subscription_payments WHERE company_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [companyId]
    );

    return successResponse({ payments: result.rows });
  } catch (err) {
    console.error('Get payments error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500);
  }
}
