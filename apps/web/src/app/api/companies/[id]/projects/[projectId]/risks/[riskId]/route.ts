import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string; riskId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const result = await query(
      `UPDATE project_risks SET
        name = COALESCE($1, name), description = $2, probability = COALESCE($3, probability),
        impact = COALESCE($4, impact), status = COALESCE($5, status), mitigation_plan = $6,
        owner_id = $7, resolved_date = $8, updated_at = NOW()
       WHERE id = $9 AND project_id = $10 AND company_id = $11 RETURNING *`,
      [body.name || null, body.description !== undefined ? body.description : null,
       body.probability || null, body.impact || null, body.status || null,
       body.mitigation_plan !== undefined ? body.mitigation_plan : null,
       body.owner_id !== undefined ? body.owner_id : null,
       body.resolved_date || null, params.riskId, params.projectId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Risk not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string; riskId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'DELETE FROM project_risks WHERE id = $1 AND project_id = $2 AND company_id = $3 RETURNING id',
      [params.riskId, params.projectId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Risk not found', 404);
    return successResponse({ message: 'Deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
