import { query } from '../../../../lib/db';
import { getCompanyId, successResponse, errorResponse } from '../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; costCenterId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT cc.*,
        (SELECT COUNT(*) FROM products p WHERE p.cost_center_id = cc.id) as product_count
       FROM cost_centers cc
       WHERE cc.id = $1 AND cc.company_id = $2`,
      [params.costCenterId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Cost center not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to fetch cost center', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; costCenterId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { code, name, description, parent_id, is_active } = body;

    if (code) {
      const existing = await query(
        'SELECT id FROM cost_centers WHERE company_id = $1 AND code = $2 AND id != $3',
        [companyId, code, params.costCenterId]
      );
      if (existing.rows.length > 0) {
        return errorResponse('Cost center code already exists', 400);
      }
    }

    const result = await query(
      `UPDATE cost_centers SET
        code = COALESCE($1, code),
        name = COALESCE($2, name),
        description = $3,
        parent_id = $4,
        is_active = COALESCE($5, is_active),
        updated_at = NOW()
       WHERE id = $6 AND company_id = $7
       RETURNING *`,
      [code || null, name || null, description !== undefined ? description : null, parent_id || null, is_active !== undefined ? is_active : null, params.costCenterId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Cost center not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to update cost center', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; costCenterId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const productCheck = await query(
      'SELECT id FROM products WHERE cost_center_id = $1 AND company_id = $2 LIMIT 1',
      [params.costCenterId, companyId]
    );

    if (productCheck.rows.length > 0) {
      return errorResponse('Cannot delete cost center with assigned products', 400);
    }

    const result = await query(
      'DELETE FROM cost_centers WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.costCenterId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Cost center not found', 404);

    return successResponse({ message: 'Cost center deleted successfully' });
  } catch {
    return errorResponse('Failed to delete cost center', 500);
  }
}
