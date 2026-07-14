import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; reasonId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description, is_active } = body;

    if (name) {
      const existing = await query(
        `SELECT id FROM adjustment_reasons WHERE company_id = $1 AND LOWER(name) = LOWER($2) AND id != $3`,
        [companyId, name, params.reasonId]
      );
      if (existing.rows.length > 0) {
        return errorResponse('An adjustment reason with this name already exists', 400);
      }
    }

    const result = await query(
      `UPDATE adjustment_reasons SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        is_active = COALESCE($3, is_active)
       WHERE id = $4 AND company_id = $5
       RETURNING *`,
      [name || null, description || null, is_active ?? null, params.reasonId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Adjustment reason not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; reasonId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `DELETE FROM adjustment_reasons WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.reasonId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Adjustment reason not found', 404);
    return successResponse({ message: 'Adjustment reason deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
