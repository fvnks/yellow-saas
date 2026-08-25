import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string; changeOrderId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const result = await query(
      `UPDATE project_change_orders SET
        title = COALESCE($1, title), description = $2, reason = $3,
        status = COALESCE($4, status), type = COALESCE($5, type),
        budget_impact = COALESCE($6, budget_impact), timeline_impact_days = COALESCE($7, timeline_impact_days),
        reviewed_by = $8, reviewed_at = CASE WHEN $4 IN ('approved','rejected') THEN NOW() ELSE reviewed_at END,
        review_notes = $9, updated_at = NOW()
       WHERE id = $10 AND project_id = $11 AND company_id = $12 RETURNING *`,
      [body.title || null, body.description !== undefined ? body.description : null,
       body.reason !== undefined ? body.reason : null, body.status || null, body.type || null,
       body.budget_impact !== undefined ? body.budget_impact : null,
       body.timeline_impact_days !== undefined ? body.timeline_impact_days : null,
       body.reviewed_by || null, body.review_notes !== undefined ? body.review_notes : null,
       params.changeOrderId, params.projectId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Change order not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string; changeOrderId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'DELETE FROM project_change_orders WHERE id = $1 AND project_id = $2 AND company_id = $3 RETURNING id',
      [params.changeOrderId, params.projectId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Change order not found', 404);
    return successResponse({ message: 'Deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
