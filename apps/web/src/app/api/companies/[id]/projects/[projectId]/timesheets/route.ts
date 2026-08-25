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
      `SELECT pt.*, e.name as employee_name, pt2.name as task_name
       FROM project_timesheets pt
       LEFT JOIN employees e ON pt.employee_id = e.id
       LEFT JOIN project_tasks pt2 ON pt.task_id = pt2.id
       WHERE pt.project_id = $1 AND pt.company_id = $2
       ORDER BY pt.date DESC, pt.created_at DESC`,
      [params.projectId, companyId]
    );
    return successResponse(result.rows);
  } catch { return errorResponse('Internal server error', 500); }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);
    const body = await request.json();
    if (!body.date || !body.hours) return errorResponse('Date and hours are required', 400);

    const result = await query(
      `INSERT INTO project_timesheets (company_id, project_id, task_id, employee_id, user_id, date, hours, description, billable)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [companyId, params.projectId, body.task_id || null, body.employee_id || null, body.user_id || null,
       body.date, body.hours, body.description || null, body.billable !== false]
    );
    return successResponse(result.rows[0], 201);
  } catch { return errorResponse('Internal server error', 500); }
}
