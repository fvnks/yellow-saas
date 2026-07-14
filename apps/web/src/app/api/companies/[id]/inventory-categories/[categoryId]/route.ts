import { query } from '../../../../lib/db';
import { getCompanyId, successResponse, errorResponse } from '../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT ic.*,
        (SELECT COUNT(*) FROM products WHERE category_id = ic.id) as product_count
       FROM inventory_categories ic
       WHERE ic.id = $1 AND ic.company_id = $2`,
      [params.categoryId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Category not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description, color, icon, sort_order, is_active } = body;

    if (name) {
      const existing = await query(
        `SELECT id FROM inventory_categories WHERE company_id = $1 AND LOWER(name) = LOWER($2) AND id != $3`,
        [companyId, name, params.categoryId]
      );
      if (existing.rows.length > 0) {
        return errorResponse('A category with this name already exists', 400);
      }
    }

    const result = await query(
      `UPDATE inventory_categories SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        color = COALESCE($3, color),
        icon = COALESCE($4, icon),
        sort_order = COALESCE($5, sort_order),
        is_active = COALESCE($6, is_active)
       WHERE id = $7 AND company_id = $8
       RETURNING *`,
      [name || null, description || null, color || null, icon || null, sort_order ?? null, is_active ?? null, params.categoryId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Category not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const productCheck = await query(
      `SELECT COUNT(*) FROM products WHERE category_id = $1 AND company_id = $2`,
      [params.categoryId, companyId]
    );
    if (parseInt(productCheck.rows[0].count) > 0) {
      return errorResponse('Cannot delete category with assigned products', 400);
    }

    const result = await query(
      `DELETE FROM inventory_categories WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.categoryId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Category not found', 404);
    return successResponse({ message: 'Category deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
