import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT pt.*,
        prof.full_name as assignee_name
       FROM project_tasks pt
       LEFT JOIN profiles prof ON pt.assignee_id = prof.id
       WHERE pt.project_id = $1 AND pt.company_id = $2
       ORDER BY pt.created_at ASC`,
      [params.projectId, companyId]
    );

    return successResponse(result.rows);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const body = await request.json();
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const {
      name, description, assignee_id, status, priority,
      start_date, due_date, estimated_hours, parent_id,
    } = body;

    if (!name) return errorResponse('Task name is required', 400);

    const result = await query(
      `INSERT INTO project_tasks (
        company_id, project_id, name, description, assignee_id, status, priority,
        start_date, due_date, estimated_hours, parent_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [companyId, params.projectId, name, description || null,
       assignee_id || null, status || 'todo', priority || 'medium',
       start_date || null, due_date || null, estimated_hours || null,
       parent_id || null, assignee_id || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
