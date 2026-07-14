import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; endpointId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let whereClause = 'WHERE wd.endpoint_id = $1 AND wd.company_id = $2';
    const queryParams: any[] = [params.endpointId, companyId];
    let paramIndex = 3;

    if (status) {
      whereClause += ` AND wd.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM webhook_deliveries wd ${whereClause}`,
      queryParams
    );

    queryParams.push(limit, offset);
    const dataResult = await query(
      `SELECT wd.* FROM webhook_deliveries wd ${whereClause} ORDER BY wd.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      queryParams
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Webhook deliveries error:', err);
    return errorResponse('Internal server error', 500);
  }
}