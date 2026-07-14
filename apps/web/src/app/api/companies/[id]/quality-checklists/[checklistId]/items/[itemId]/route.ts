import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; checklistId: string; itemId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { sequence, check_type, description, acceptance_criteria, min_value, max_value, uom, is_critical, aql_level } = body;

    const validTypes = ['visual', 'measurement', 'functional', 'documentation'];
    if (check_type && !validTypes.includes(check_type)) {
      return errorResponse(`check_type must be one of: ${validTypes.join(', ')}`, 400);
    }

    const result = await query(
      `UPDATE quality_checklist_items SET
        sequence = COALESCE($1, sequence),
        check_type = COALESCE($2, check_type),
        description = COALESCE($3, description),
        acceptance_criteria = COALESCE($4, acceptance_criteria),
        min_value = COALESCE($5, min_value),
        max_value = COALESCE($6, max_value),
        uom = COALESCE($7, uom),
        is_critical = COALESCE($8, is_critical),
        aql_level = COALESCE($9, aql_level),
        updated_at = NOW()
       WHERE id = $10 AND checklist_id = $11 AND company_id = $12
       RETURNING *`,
      [sequence, check_type, description, acceptance_criteria, min_value, max_value, uom, is_critical, aql_level, params.itemId, params.checklistId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Item not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Update checklist item error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; checklistId: string; itemId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'DELETE FROM quality_checklist_items WHERE id = $1 AND checklist_id = $2 AND company_id = $3 RETURNING id',
      [params.itemId, params.checklistId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Item not found', 404);

    return successResponse({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete checklist item error:', err);
    return errorResponse('Internal server error', 500);
  }
}