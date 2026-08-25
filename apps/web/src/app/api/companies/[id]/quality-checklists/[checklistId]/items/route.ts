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
      `SELECT * FROM quality_checklist_items
       WHERE checklist_id = $1 AND company_id = $2
       ORDER BY sequence`,
      [params.checklistId, companyId]
    );

    return successResponse(result.rows);
  } catch (err) {
    console.error('Get checklist items error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; checklistId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { sequence, check_type, description, acceptance_criteria, min_value, max_value, uom, is_critical, aql_level } = body;

    if (!description) {
      return errorResponse('description is required', 400);
    }

    const validTypes = ['visual', 'measurement', 'functional', 'documentation'];
    if (check_type && !validTypes.includes(check_type)) {
      return errorResponse(`check_type must be one of: ${validTypes.join(', ')}`, 400);
    }

    const checklistCheck = await query(
      'SELECT id FROM quality_checklists WHERE id = $1 AND company_id = $2',
      [params.checklistId, companyId]
    );

    if (checklistCheck.rows.length === 0) return errorResponse('Checklist not found', 404);

    const result = await query(
      `INSERT INTO quality_checklist_items (company_id, checklist_id, sequence, check_type, description, acceptance_criteria, min_value, max_value, uom, is_critical, aql_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        companyId,
        params.checklistId,
        sequence || 1,
        check_type || 'visual',
        description,
        acceptance_criteria || null,
        min_value || null,
        max_value || null,
        uom || null,
        is_critical || false,
        aql_level || null,
      ]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Create checklist item error:', err);
    return errorResponse('Internal server error', 500);
  }
}