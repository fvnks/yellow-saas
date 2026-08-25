import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);

    const countResult = await query(
      'SELECT COUNT(*) FROM project_activity_log WHERE project_id = $1 AND company_id = $2',
      [params.projectId, companyId]
    );

    const dataResult = await query(
      `SELECT * FROM project_activity_log
       WHERE project_id = $1 AND company_id = $2
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [params.projectId, companyId, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { actor_id, actor_name, action, entity_type, entity_id, entity_name, old_value, new_value, metadata } = body;

    if (!action || !entity_type) return errorResponse('action and entity_type are required', 400);

    const result = await query(
      `INSERT INTO project_activity_log (company_id, project_id, actor_id, actor_name, action, entity_type, entity_id, entity_name, old_value, new_value, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [companyId, params.projectId, actor_id || null, actor_name || null, action, entity_type,
       entity_id || null, entity_name || null, old_value ? JSON.stringify(old_value) : null,
       new_value ? JSON.stringify(new_value) : null, metadata ? JSON.stringify(metadata) : null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
