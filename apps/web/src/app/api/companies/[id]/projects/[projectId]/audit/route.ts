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

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `SELECT al.*, p.first_name || ' ' || p.last_name as user_name, p.avatar_url
       FROM project_audit_log al
       LEFT JOIN profiles p ON p.id = al.user_id
       WHERE al.project_id = $1 AND al.company_id = $2`;
    const args: any[] = [params.projectId, companyId];

    if (taskId) {
      args.push(taskId);
      sql += ` AND al.task_id = $${args.length}`;
    }

    sql += ` ORDER BY al.created_at DESC LIMIT $${args.length + 1}`;
    args.push(limit);

    const result = await query(sql, args);
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
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { task_id, user_id, action, entity_type, entity_id, old_values, new_values, description } = body;

    if (!action || !entity_type) return errorResponse('action and entity_type required', 400);

    const result = await query(
      `INSERT INTO project_audit_log (company_id, project_id, task_id, user_id, action, entity_type, entity_id, old_values, new_values, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [companyId, params.projectId, task_id || null, user_id || null, action, entity_type,
       entity_id || null, old_values ? JSON.stringify(old_values) : null,
       new_values ? JSON.stringify(new_values) : null, description || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
