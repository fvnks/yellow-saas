import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const sellable = url.searchParams.get('sellable');

    let whereClause = 'WHERE rp.company_id = $1';
    const queryParams: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (rp.name ILIKE $${paramIndex} OR rp.sku ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (sellable === 'true') {
      whereClause += ` AND EXISTS (SELECT 1 FROM formulas f WHERE f.output_product_id = rp.id AND f.is_active = true AND f.company_id = $1)`;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM recipe_products rp ${whereClause}`,
      queryParams
    );

    const dataResult = await query(
      `SELECT rp.*,
        (SELECT json_build_object('id', f.id, 'name', f.name, 'yield_quantity', f.yield_quantity, 'yield_unit', f.yield_unit)
         FROM formulas f WHERE f.output_product_id = rp.id AND f.is_active = true AND f.company_id = rp.company_id LIMIT 1) as formula
       FROM recipe_products rp
       ${whereClause}
       ORDER BY rp.name ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (e: any) {
    console.error('GET recipe-products error:', e);
    return errorResponse(e.message, 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, sku, unit_of_measure, cost_price, sale_price, description } = body;

    if (!name || !sku) return errorResponse('Nombre y SKU son requeridos', 400);

    const { rows } = await query(
      `INSERT INTO recipe_products (company_id, name, sku, unit_of_measure, cost_price, sale_price, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (company_id, sku) DO UPDATE SET
         name = EXCLUDED.name, unit_of_measure = EXCLUDED.unit_of_measure,
         cost_price = EXCLUDED.cost_price, sale_price = EXCLUDED.sale_price,
         description = EXCLUDED.description, updated_at = NOW()
       RETURNING *`,
      [companyId, name, sku, unit_of_measure || 'UN', cost_price || 0, sale_price || 0, description || null]
    );

    return successResponse(rows[0], 201);
  } catch (e: any) {
    console.error('POST recipe-products error:', e);
    return errorResponse(e.message, 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { id, stock, min_stock, name, sku, unit_of_measure, cost_price, sale_price, description, is_active } = body;

    if (!id) return errorResponse('Product ID requerido', 400);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (stock !== undefined) { fields.push(`stock = $${idx}`); values.push(stock); idx++; }
    if (min_stock !== undefined) { fields.push(`min_stock = $${idx}`); values.push(min_stock); idx++; }
    if (name !== undefined) { fields.push(`name = $${idx}`); values.push(name); idx++; }
    if (sku !== undefined) { fields.push(`sku = $${idx}`); values.push(sku); idx++; }
    if (unit_of_measure !== undefined) { fields.push(`unit_of_measure = $${idx}`); values.push(unit_of_measure); idx++; }
    if (cost_price !== undefined) { fields.push(`cost_price = $${idx}`); values.push(cost_price); idx++; }
    if (sale_price !== undefined) { fields.push(`sale_price = $${idx}`); values.push(sale_price); idx++; }
    if (description !== undefined) { fields.push(`description = $${idx}`); values.push(description); idx++; }
    if (is_active !== undefined) { fields.push(`is_active = $${idx}`); values.push(is_active); idx++; }

    if (fields.length === 0) return errorResponse('No fields to update', 400);

    fields.push(`updated_at = NOW()`);
    values.push(companyId, id);

    const { rows } = await query(
      `UPDATE recipe_products SET ${fields.join(', ')} WHERE company_id = $${idx} AND id = $${idx + 1} RETURNING *`,
      values
    );

    if (rows.length === 0) return errorResponse('Producto no encontrado', 404);
    return successResponse(rows[0]);
  } catch (e: any) {
    console.error('PATCH recipe-products error:', e);
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { id } = body;

    if (!id) return errorResponse('Product ID requerido', 400);

    const { rows: formulaRows } = await query(
      `SELECT id, name FROM formulas WHERE output_product_id = $1 AND company_id = $2`,
      [id, companyId]
    );
    if (formulaRows.length > 0) {
      return errorResponse(`No se puede eliminar: es producto de salida de la fórmula "${formulaRows[0].name}". Desasigna primero la fórmula.`, 400);
    }

    const { rows: ingredientRows } = await query(
      `SELECT fi.id FROM formula_ingredients fi JOIN formulas f ON f.id = fi.formula_id WHERE fi.product_id = $1 AND f.company_id = $2`,
      [id, companyId]
    );
    if (ingredientRows.length > 0) {
      return errorResponse('No se puede eliminar: es ingrediente de una fórmula. Elimina la fórmula primero.', 400);
    }

    const { rowCount } = await query(
      `DELETE FROM recipe_products WHERE company_id = $1 AND id = $2`,
      [companyId, id]
    );

    if (rowCount === 0) return errorResponse('Producto no encontrado', 404);
    return successResponse({ message: 'Producto eliminado' });
  } catch (e: any) {
    console.error('DELETE recipe-products error:', e);
    return errorResponse(e.message, 500);
  }
}
