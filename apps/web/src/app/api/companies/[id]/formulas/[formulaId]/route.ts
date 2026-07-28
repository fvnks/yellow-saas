import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(request: NextRequest, { params }: { params: { id: string; formulaId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: formulaRows } = await query(
      `SELECT f.*,
        (SELECT json_build_object('id', rp.id, 'name', rp.name, 'sku', rp.sku, 'sale_price', rp.sale_price, 'price', rp.sale_price) FROM recipe_products rp WHERE rp.id = f.output_product_id) as output_product
       FROM formulas f
       WHERE f.id = $1 AND f.company_id = $2`,
      [params.formulaId, companyId]
    );

    if (formulaRows.length === 0) return errorResponse('Receta no encontrada', 404);

    const { rows: ingredients } = await query(
      `SELECT fi.*,
        (SELECT json_build_object('id', rp.id, 'name', rp.name, 'sku', rp.sku, 'unit_of_measure', rp.unit_of_measure) FROM recipe_products rp WHERE rp.id = fi.product_id) as product,
        (SELECT COALESCE(SUM(sl.quantity), 0) FROM stock_levels sl WHERE sl.product_id = fi.product_id AND sl.company_id = fi.company_id) as current_stock
       FROM formula_ingredients fi
       WHERE fi.formula_id = $1
       ORDER BY fi.created_at ASC`,
      [params.formulaId]
    );

    const { rows: productions } = await query(
      `SELECT fp.*,
        (SELECT json_build_object('id', w.id, 'name', w.name) FROM warehouses w WHERE w.id = fp.warehouse_id) as warehouse
       FROM formula_productions fp
       WHERE fp.formula_id = $1
       ORDER BY fp.created_at DESC
       LIMIT 20`,
      [params.formulaId]
    );

    return successResponse({ ...formulaRows[0], ingredients, productions });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; formulaId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description, output_product_id, yield_quantity, yield_unit, is_active, ingredients } = body;

    const { rows } = await query(
      `UPDATE formulas
       SET name = COALESCE($3, name), description = $4, output_product_id = $5,
           yield_quantity = COALESCE($6, yield_quantity), yield_unit = COALESCE($7, yield_unit),
           is_active = COALESCE($8, is_active), updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [params.formulaId, companyId, name, description, output_product_id, yield_quantity, yield_unit, is_active]
    );

    if (rows.length === 0) return errorResponse('Receta no encontrada', 404);

    if (ingredients) {
      await query('DELETE FROM formula_ingredients WHERE formula_id = $1', [params.formulaId]);
      for (const ing of ingredients) {
        if (!ing.product_id || !ing.quantity) continue;
        await query(
          `INSERT INTO formula_ingredients (formula_id, company_id, product_id, quantity, unit)
           VALUES ($1, $2, $3, $4, $5)`,
          [params.formulaId, companyId, ing.product_id, ing.quantity, ing.unit || 'un']
        );
      }
    }

    return successResponse(rows[0]);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; formulaId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rowCount } = await query(
      'DELETE FROM formulas WHERE id = $1 AND company_id = $2',
      [params.formulaId, companyId]
    );

    if (rowCount === 0) return errorResponse('Receta no encontrada', 404);
    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
