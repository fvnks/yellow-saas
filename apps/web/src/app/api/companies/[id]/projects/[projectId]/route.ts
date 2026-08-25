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
      `SELECT p.*,
        c.name as customer_name,
        prof.full_name as project_manager_name,
        cb.full_name as created_by_name,
        cc.name as cost_center_name,
        cc.code as cost_center_code,
        (SELECT COUNT(*) FROM project_tasks pt WHERE pt.project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM project_tasks pt WHERE pt.project_id = p.id AND pt.status = 'done') as completed_tasks
       FROM projects p
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN profiles prof ON p.project_manager_id = prof.id
       LEFT JOIN profiles cb ON p.created_by = cb.id
       LEFT JOIN cost_centers cc ON p.cost_center_id = cc.id
       WHERE p.id = $1 AND p.company_id = $2`,
      [params.projectId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Project not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to fetch project', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const result = await query(
      `UPDATE projects SET
        name = $1, code = $2, description = $3, customer_id = $4,
        start_date = $5, end_date = $6, budget = $7, status = $8,
        progress = $9, project_manager_id = $10, cost_center_id = $11, updated_at = NOW()
       WHERE id = $12 AND company_id = $13
       RETURNING *`,
      [body.name, body.code, body.description, body.customer_id,
       body.start_date, body.end_date, body.budget, body.status,
       body.progress, body.project_manager_id, body.cost_center_id || null, params.projectId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Project not found', 404);

    return successResponse(result.rows[0]);
  } catch (err: any) {
    if (err?.code === '23505') return errorResponse('Project code already exists', 400);
    return errorResponse('Failed to update project', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    await query('DELETE FROM project_tasks WHERE project_id = $1 AND company_id = $2', [params.projectId, companyId]);

    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.projectId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Project not found', 404);

    return successResponse({ message: 'Project deleted successfully' });
  } catch {
    return errorResponse('Failed to delete project', 500);
  }
}
