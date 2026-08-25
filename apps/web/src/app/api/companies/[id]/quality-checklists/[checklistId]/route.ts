import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; checklistId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT qc.*,
        (SELECT json_agg(json_build_object(
          'id', qci.id,
          'sequence', qci.sequence,
          'check_type', qci.check_type,
          'description', qci.description,
          'acceptance_criteria', qci.acceptance_criteria,
          'min_value', qci.min_value,
          'max_value', qci.max_value,
          'uom', qci.uom,
          'is_critical', qci.is_critical,
          'aql_level', qci.aql_level
        ) ORDER BY qci.sequence)
         FROM quality_checklist_items qci WHERE qci.checklist_id = qc.id) as items
       FROM quality_checklists qc
       WHERE qc.id = $1 AND qc.company_id = $2`,
      [params.checklistId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Checklist not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Get quality checklist error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; checklistId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description, type, version, is_active } = body;

    const validTypes = ['incoming', 'in_process', 'final', 'shipping'];
    if (type && !validTypes.includes(type)) {
      return errorResponse(`type must be one of: ${validTypes.join(', ')}`, 400);
    }

    const result = await query(
      `UPDATE quality_checklists SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        version = COALESCE($4, version),
        is_active = COALESCE($5, is_active),
        updated_at = NOW()
       WHERE id = $6 AND company_id = $7
       RETURNING *`,
      [name, description, type, version, is_active, params.checklistId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Checklist not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Update quality checklist error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; checklistId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'DELETE FROM quality_checklists WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.checklistId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Checklist not found', 404);

    return successResponse({ message: 'Checklist deleted successfully' });
  } catch (err) {
    console.error('Delete quality checklist error:', err);
    return errorResponse('Internal server error', 500);
  }
}