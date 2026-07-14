import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
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

    let whereClause = 'WHERE ps.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (productId) {
      whereClause += ` AND ps.product_id = $${paramIndex}`;
      params.push(productId);
      paramIndex++;
    }

    if (warehouseId) {
      whereClause += ` AND ps.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND ps.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (ps.serial_number ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM product_serials ps
       JOIN products p ON ps.product_id = p.id
       ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT ps.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) as product,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse
       FROM product_serials ps
       JOIN products p ON ps.product_id = p.id
       JOIN warehouses w ON ps.warehouse_id = w.id
       ${whereClause}
       ORDER BY ps.created_at DESC
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
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { product_id, warehouse_id, serial_number, notes } = body;

    if (!product_id || !warehouse_id || !serial_number) {
      return errorResponse('product_id, warehouse_id, and serial_number are required', 400);
    }

    const existing = await query(
      `SELECT id FROM product_serials WHERE company_id = $1 AND serial_number = $2`,
      [companyId, serial_number]
    );
    if (existing.rows.length > 0) {
      return errorResponse('A serial with this number already exists', 400);
    }

    const result = await query(
      `INSERT INTO product_serials (company_id, product_id, warehouse_id, serial_number, status, notes)
       VALUES ($1, $2, $3, $4, 'available', $5)
       RETURNING *`,
      [companyId, product_id, warehouse_id, serial_number, notes || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
