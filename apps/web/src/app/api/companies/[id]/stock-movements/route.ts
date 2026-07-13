import { query } from '../../../lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const product = url.searchParams.get('product');
    const warehouse = url.searchParams.get('warehouse');
    const type = url.searchParams.get('type');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    const params: any[] = [companyId];
    let where = 'WHERE sm.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND sm.notes ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (product) {
      where += ` AND sm.product_id = $${paramIndex}`;
      params.push(product);
      paramIndex++;
    }

    if (warehouse) {
      where += ` AND sm.warehouse_id = $${paramIndex}`;
      params.push(warehouse);
      paramIndex++;
    }

    if (type) {
      where += ` AND sm.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (from) {
      where += ` AND sm.created_at >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      where += ` AND sm.created_at <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as count FROM stock_movements sm ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT sm.*,
        (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = sm.product_id) as product,
        (SELECT json_build_object('id', w.id, 'name', w.name, 'code', w.code) FROM warehouses w WHERE w.id = sm.warehouse_id) as warehouse
       FROM stock_movements sm
       ${where}
       ORDER BY sm.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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
      product_id, warehouse_id, type, quantity, unit_cost,
      batch_number, expiry_date, notes,
    } = body;

    if (!product_id || !warehouse_id || !type || quantity === undefined) {
      return errorResponse('Product, warehouse, type, and quantity are required', 400);
    }

    const validTypes = ['in', 'out', 'transfer_in', 'transfer_out', 'adjustment', 'initial'];
    if (!validTypes.includes(type)) {
      return errorResponse(`Invalid type. Must be one of: ${validTypes.join(', ')}`, 400);
    }

    const finalQuantity = type === 'out' || type === 'transfer_out' ? -Math.abs(quantity) : Math.abs(quantity);

    const { rows: movementRows } = await query(
      `INSERT INTO stock_movements (company_id, product_id, warehouse_id, type, quantity, unit_cost, total_cost, batch_number, expiry_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        companyId, product_id, warehouse_id, type, finalQuantity,
        unit_cost || null, unit_cost ? unit_cost * Math.abs(quantity) : null,
        batch_number || null, expiry_date || null, notes || null,
      ]
    );

    const movement = movementRows[0];

    const { rows: stockRows } = await query(
      `SELECT id, quantity FROM stock_levels WHERE company_id = $1 AND product_id = $2 AND warehouse_id = $3`,
      [companyId, product_id, warehouse_id]
    );

    if (stockRows[0]) {
      await query(
        `UPDATE stock_levels SET quantity = $1, last_movement_at = NOW() WHERE id = $2`,
        [stockRows[0].quantity + finalQuantity, stockRows[0].id]
      );
    } else if (finalQuantity > 0) {
      await query(
        `INSERT INTO stock_levels (company_id, product_id, warehouse_id, quantity, last_movement_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [companyId, product_id, warehouse_id, finalQuantity]
      );
    }

    return successResponse(movement, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
