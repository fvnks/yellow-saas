import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server'; export async function GET(request: NextRequest) { try { const companyId = await getCompanyId(request); if (!companyId) return errorResponse('Company ID not found', 400); const result = await query( 'SELECT COUNT(*) as count FROM notifications WHERE company_id = $1 AND is_read = false', [companyId] ); return successResponse({ count: parseInt(result.rows[0].count) }); } catch { return errorResponse('Internal server error', 500); }
}
