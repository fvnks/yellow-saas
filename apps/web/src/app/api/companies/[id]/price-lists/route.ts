import { query } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'name', 'is_default', 'id'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';

    const params: any[] = [companyId];
    let where = 'WHERE pl.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND pl.name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as count FROM price_lists pl ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT pl.*,
        (SELECT json_agg(json_build_object(
          'id', pli.id, 'product_id', pli.product_id, 'variant_id', pli.variant_id, 'price', pli.price, 'min_quantity', pli.min_quantity,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = pli.product_id)
        )) FROM price_list_items pli WHERE pli.price_list_id = pl.id) as items
       FROM price_lists pl
       ${where}
       ORDER BY pl.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(rows, total, page, limit);
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
      name, description, is_default, currency, adjustment_type,
      adjustment_value, items,
    } = body;

    if (!name) {
      return errorResponse('Name is required', 400);
    }

    if (is_default) {
      await query(
        `UPDATE price_lists SET is_default = false WHERE company_id = $1 AND is_default = true`,
        [companyId]
      );
    }

    const { rows: listRows } = await query(
      `INSERT INTO price_lists (company_id, name, description, is_default, currency, adjustment_type, adjustment_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        companyId, name, description || null, is_default || false,
        currency || 'CLP', adjustment_type || 'fixed', adjustment_value || 0,
      ]
    );

    const priceList = listRows[0];

    if (items?.length) {
      for (const item of items) {
        await query(
          `INSERT INTO price_list_items (price_list_id, product_id, variant_id, price, min_quantity)
           VALUES ($1, $2, $3, $4, $5)`,
          [priceList.id, item.product_id, item.variant_id || null, item.price, item.min_quantity || 1]
        );
      }

      return successResponse({ ...priceList, items }, 201);
    }

    return successResponse(priceList, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
