import { query } from '../../../lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const productId = url.searchParams.get('product_id');
    const warehouseId = url.searchParams.get('warehouse_id');
    const status = url.searchParams.get('status');

    let whereClause = 'WHERE pb.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (productId) { whereClause += ` AND pb.product_id = $${paramIndex}`; params.push(productId); paramIndex++; }
    if (warehouseId) { whereClause += ` AND pb.warehouse_id = $${paramIndex}`; params.push(warehouseId); paramIndex++; }
    if (status) { whereClause += ` AND pb.status = $${paramIndex}`; params.push(status); paramIndex++; }
    if (search) { whereClause += ` AND (pb.batch_number ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`; params.push(`%${search}%`); paramIndex++; }

    const countResult = await query(`SELECT COUNT(*) FROM product_batches pb JOIN products p ON pb.product_id = p.id ${whereClause}`, params);

    const dataResult = await query(
      `SELECT pb.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) as product,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse
       FROM product_batches pb
       JOIN products p ON pb.product_id = p.id
       JOIN warehouses w ON pb.warehouse_id = w.id
       ${whereClause}
       ORDER BY pb.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Product batches error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { product_id, warehouse_id, batch_number, quantity, expiry_date, manufacturing_date, notes } = body;

    if (!product_id || !warehouse_id || !batch_number) {
      return errorResponse('product_id, warehouse_id, and batch_number are required', 400);
    }

    const result = await query(
      `INSERT INTO product_batches (company_id, product_id, warehouse_id, batch_number, quantity, expiry_date, manufacturing_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [companyId, product_id, warehouse_id, batch_number, quantity || 0, expiry_date || null, manufacturing_date || null, notes || null]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Create batch error:', err);
    return errorResponse('Internal server error', 500);
  }
}