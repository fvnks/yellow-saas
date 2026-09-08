import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'name', 'sku', 'cost_price', 'sale_price', 'is_active', 'id'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';

    let whereClause = 'WHERE p.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.barcode ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM products p ${whereClause}`,
      params
    );

    const dataResult = await query(`
      SELECT 
        p.id,
        p.company_id,
        p.sku,
        p.name,
        p.description,
        p.type,
        p.category_id,
        p.unit_of_measure,
        p.cost_price,
        p.sale_price,
        p.min_stock,
        p.max_stock,
        p.track_stock,
        p.barcode,
        p.tax_id,
        p.is_active,
        p.created_at,
        p.updated_at,
        ic.name as category_name,
        (
          SELECT json_agg(
            json_build_object(
              'id', sl.id,
              'quantity', sl.quantity,
              'warehouse', json_build_object(
                'id', w.id,
                'name', w.name,
                'code', w.code
              )
            )
          )
          FROM stock_levels sl
          JOIN warehouses w ON w.id = sl.warehouse_id
          WHERE sl.product_id = p.id AND sl.company_id = p.company_id
        ) as stock_levels
      FROM products p
      LEFT JOIN inventory_categories ic ON ic.id = p.category_id
      ${whereClause}
      ORDER BY ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

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
      name,
      sku,
      description,
      type = 'product',
      category_id,
      unit_of_measure = 'UN',
      cost_price = 0,
      sale_price = 0,
      min_stock = 0,
      max_stock = 0,
      track_stock = true,
      barcode,
      tax_id,
      is_active = true,
      warehouse_id,
      initial_stock,
    } = body;

    if (!name || !sku) {
      return errorResponse('Name and SKU are required', 400);
    }

    const existing = await query(
      'SELECT id FROM products WHERE company_id = $1 AND sku = $2',
      [companyId, sku]
    );
    if (existing.rows.length > 0) {
      return errorResponse('Ya existe un producto con este SKU', 409);
    }

    const result = await query(
      `INSERT INTO products (
        company_id, sku, name, description, type, category_id, unit_of_measure,
        cost_price, sale_price, min_stock, max_stock, track_stock, barcode, tax_id, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        companyId,
        sku,
        name,
        description || null,
        type,
        category_id || null,
        unit_of_measure,
        cost_price,
        sale_price,
        min_stock,
        max_stock,
        track_stock,
        barcode || null,
        tax_id || null,
        is_active,
      ]
    );

    const product = result.rows[0];

    if (warehouse_id && initial_stock && track_stock) {
      await query(
        `INSERT INTO stock_levels (company_id, product_id, warehouse_id, quantity)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (company_id, product_id, warehouse_id)
         DO UPDATE SET quantity = stock_levels.quantity + $4`,
        [companyId, product.id, warehouse_id, initial_stock]
      );
    }

    return successResponse(product, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
