import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const { rows } = await query(
      `SELECT * FROM project_task_changelog 
       WHERE company_id = $1 AND task_id = $2 
       ORDER BY created_at DESC 
       LIMIT $3 OFFSET $4`,
      [companyId, params.taskId, limit, offset]
    );

    const { rows: countRows } = await query(
      'SELECT COUNT(*) as total FROM project_task_changelog WHERE company_id = $1 AND task_id = $2',
      [companyId, params.taskId]
    );

    return successResponse({ items: rows, total: parseInt(countRows[0]?.total || '0') });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { field_name, old_value, new_value, change_type = 'update', user_id, user_name } = body;

    if (!field_name) return errorResponse('field_name is required', 400);

    const { rows } = await query(
      `INSERT INTO project_task_changelog (company_id, task_id, field_name, old_value, new_value, change_type, user_id, user_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [companyId, params.taskId, field_name, old_value, new_value, change_type, user_id, user_name]
    );

    return successResponse(rows[0], 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
