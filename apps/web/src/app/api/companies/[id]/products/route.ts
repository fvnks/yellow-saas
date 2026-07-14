import { query } from '../../../lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const warehouse = url.searchParams.get('warehouse');
    const type = url.searchParams.get('type');
    const includeInactive = url.searchParams.get('include_inactive') === 'true';

    let whereClause = `WHERE p.company_id = $1${includeInactive ? '' : ' AND p.is_active = true'}`;
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.barcode ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND p.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND p.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM products p ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT p.*,
        json_build_object('id', c.id, 'name', c.name) as category,
        CASE WHEN cc.id IS NOT NULL THEN json_build_object('id', cc.id, 'name', cc.name, 'code', cc.code) ELSE NULL END as cost_center,
        CASE WHEN t.id IS NOT NULL THEN json_build_object('id', t.id, 'name', t.name, 'rate', t.rate, 'code', t.code) ELSE NULL END as tax
       FROM products p
       LEFT JOIN inventory_categories c ON p.category_id = c.id
       LEFT JOIN cost_centers cc ON p.cost_center_id = cc.id
       LEFT JOIN taxes t ON p.tax_id = t.id
       ${whereClause}
       ORDER BY p.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const {
      sku, name, category_id, description, type, unit_of_measure,
      cost_price, sale_price, min_stock, max_stock, track_stock,
      barcode, tax_id, initial_stock, warehouse_id, cost_center_id,
    } = body;

    if (!sku || !name) {
      return errorResponse('SKU and name are required', 400);
    }

    const productResult = await query(
      `INSERT INTO products (company_id, sku, name, category_id, description, type, unit_of_measure, cost_price, sale_price, min_stock, max_stock, track_stock, barcode, tax_id, cost_center_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [companyId, sku, name, category_id || null, description || null, type || 'product', unit_of_measure || 'UN', cost_price || 0, sale_price || 0, min_stock || 0, max_stock || 0, track_stock !== false, barcode || null, tax_id || null, cost_center_id || null]
    );

    const product = productResult.rows[0];

    if (initial_stock && warehouse_id && initial_stock > 0) {
      await query(
        `INSERT INTO stock_levels (company_id, product_id, warehouse_id, quantity)
         VALUES ($1, $2, $3, $4)`,
        [companyId, product.id, warehouse_id, initial_stock]
      );

      await query(
        `INSERT INTO stock_movements (company_id, product_id, warehouse_id, type, quantity, notes)
         VALUES ($1, $2, $3, 'initial', $4, 'Stock inicial')`,
        [companyId, product.id, warehouse_id, initial_stock]
      );
    }

    return successResponse(product, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}