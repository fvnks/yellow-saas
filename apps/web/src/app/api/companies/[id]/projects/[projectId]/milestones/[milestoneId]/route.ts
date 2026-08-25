import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string; milestoneId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);
    const body = await request.json();

    const result = await query(
      `UPDATE project_milestones SET name=$1, description=$2, due_date=$3, status=$4, sort_order=$5, completed_at=$6, updated_at=NOW()
       WHERE id=$7 AND project_id=$8 AND company_id=$9 RETURNING *`,
      [body.name, body.description, body.due_date, body.status || 'pending', body.sort_order || 0,
       body.status === 'completed' ? new Date().toISOString() : null,
       params.milestoneId, params.projectId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Milestone not found', 404);
    return successResponse(result.rows[0]);
  } catch { return errorResponse('Internal server error', 500); }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string; milestoneId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);
    const result = await query(
      'DELETE FROM project_milestones WHERE id=$1 AND project_id=$2 AND company_id=$3 RETURNING id',
      [params.milestoneId, params.projectId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Milestone not found', 404);
    return successResponse({ message: 'Deleted' });
  } catch { return errorResponse('Internal server error', 500); }
}
