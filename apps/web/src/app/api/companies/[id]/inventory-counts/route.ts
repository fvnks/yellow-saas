import { query } from '../../../lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let whereClause = 'WHERE ic.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND ic.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (ic.count_number ILIKE $${paramIndex} OR w.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM inventory_counts ic ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT ic.*,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        (SELECT COUNT(*) FROM inventory_count_items WHERE count_id = ic.id) as items_count,
        (SELECT COUNT(*) FROM inventory_count_items WHERE count_id = ic.id AND counted_quantity IS NOT NULL) as counted_items
       FROM inventory_counts ic
       JOIN warehouses w ON ic.warehouse_id = w.id
       ${whereClause}
       ORDER BY ic.created_at DESC
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
    const { warehouse_id, count_type, notes } = body;

    if (!warehouse_id) {
      return errorResponse('Warehouse is required', 400);
    }

    const numResult = await query(
      `SELECT COUNT(*) + 1 as next_num FROM inventory_counts WHERE company_id = $1`,
      [companyId]
    );
    const countNumber = `IC-${String(numResult.rows[0].next_num).padStart(5, '0')}`;

    const countResult = await query(
      `INSERT INTO inventory_counts (company_id, count_number, warehouse_id, count_type, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'draft')
       RETURNING *`,
      [companyId, countNumber, warehouse_id, count_type || 'full', notes || null]
    );

    const count = countResult.rows[0];

    // Snapshot current stock for all products in this warehouse
    const stockSnapshot = await query(
      `SELECT sl.product_id, sl.quantity
       FROM stock_levels sl
       JOIN products p ON sl.product_id = p.id
       WHERE sl.company_id = $1 AND sl.warehouse_id = $2 AND p.track_stock = true AND p.is_active = true`,
      [companyId, warehouse_id]
    );

    for (const row of stockSnapshot.rows) {
      await query(
        `INSERT INTO inventory_count_items (company_id, count_id, product_id, system_quantity)
         VALUES ($1, $2, $3, $4)`,
        [companyId, count.id, row.product_id, row.quantity]
      );
    }

    return successResponse(count, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
