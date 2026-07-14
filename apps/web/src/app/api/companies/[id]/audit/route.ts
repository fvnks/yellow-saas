import { query } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const entityType = url.searchParams.get('entity_type');
    const userId = url.searchParams.get('user_id');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    const params: any[] = [companyId];
    let where = 'WHERE al.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND (al.action ILIKE $${paramIndex} OR al.entity_type ILIKE $${paramIndex} OR al.entity_id::text ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (action) {
      where += ` AND al.action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }

    if (entityType) {
      where += ` AND al.entity_type = $${paramIndex}`;
      params.push(entityType);
      paramIndex++;
    }

    if (userId) {
      where += ` AND al.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (from) {
      where += ` AND al.created_at >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      where += ` AND al.created_at <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) as count FROM audit_logs al ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT al.*,
        (SELECT json_build_object('id', pr.id, 'full_name', pr.full_name, 'email', pr.email) FROM profiles pr WHERE pr.id = al.user_id) as "user",
        CASE
          WHEN al.old_data IS NOT NULL AND al.new_data IS NOT NULL THEN 'Updated'
          WHEN al.old_data IS NOT NULL THEN 'Deleted'
          WHEN al.new_data IS NOT NULL THEN 'Created'
          ELSE al.action
        END as details
       FROM audit_logs al
       ${where}
       ORDER BY al.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(rows, total, page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
