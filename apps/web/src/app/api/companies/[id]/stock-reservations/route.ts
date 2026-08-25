import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const productId = url.searchParams.get('product_id');

    let whereClause = 'WHERE sr.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (status) { whereClause += ` AND sr.status = $${paramIndex}`; params.push(status); paramIndex++; }
    if (productId) { whereClause += ` AND sr.product_id = $${paramIndex}`; params.push(productId); paramIndex++; }

    const countResult = await query(`SELECT COUNT(*) FROM stock_reservations sr ${whereClause}`, params);
    const dataResult = await query(
      `SELECT sr.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) as product,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse
       FROM stock_reservations sr
       JOIN products p ON sr.product_id = p.id
       JOIN warehouses w ON sr.warehouse_id = w.id
       ${whereClause}
       ORDER BY sr.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Stock reservations error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { product_id, warehouse_id, quantity, reference_type, reference_id, expires_at, notes } = body;

    if (!product_id || !warehouse_id || !quantity) {
      return errorResponse('product_id, warehouse_id, and quantity are required', 400);
    }

    const result = await query(
      `INSERT INTO stock_reservations (company_id, product_id, warehouse_id, quantity, reference_type, reference_id, expires_at, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (SELECT id FROM profiles WHERE company_id = $1 LIMIT 1))
       RETURNING *`,
      [companyId, product_id, warehouse_id, quantity, reference_type || 'manual', reference_id || null, expires_at || null, notes || null]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Create reservation error:', err);
    return errorResponse('Internal server error', 500);
  }
}
