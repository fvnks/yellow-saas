import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let whereClause = 'WHERE st.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND st.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (st.transfer_number ILIKE $${paramIndex} OR sw.name ILIKE $${paramIndex} OR dw.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM stock_transfers st ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT st.*,
        json_build_object('id', sw.id, 'name', sw.name, 'code', sw.code) as source_warehouse,
        json_build_object('id', dw.id, 'name', dw.name, 'code', dw.code) as destination_warehouse,
        (SELECT COUNT(*) FROM stock_transfer_items WHERE transfer_id = st.id) as items_count,
        COALESCE((SELECT SUM(quantity) FROM stock_transfer_items WHERE transfer_id = st.id), 0) as total_quantity
       FROM stock_transfers st
       JOIN warehouses sw ON st.source_warehouse_id = sw.id
       JOIN warehouses dw ON st.destination_warehouse_id = dw.id
       ${whereClause}
       ORDER BY st.created_at ${(order || 'asc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
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
    const { source_warehouse_id, destination_warehouse_id, notes, items } = body;

    if (!source_warehouse_id || !destination_warehouse_id) {
      return errorResponse('Source and destination warehouses are required', 400);
    }
    if (source_warehouse_id === destination_warehouse_id) {
      return errorResponse('Source and destination warehouses must be different', 400);
    }
    if (!items || items.length === 0) {
      return errorResponse('At least one item is required', 400);
    }

    const numResult = await query(
      `SELECT COUNT(*) + 1 as next_num FROM stock_transfers WHERE company_id = $1`,
      [companyId]
    );
    const transferNumber = `TRF-${String(numResult.rows[0].next_num).padStart(5, '0')}`;

    const transferResult = await query(
      `INSERT INTO stock_transfers (company_id, transfer_number, source_warehouse_id, destination_warehouse_id, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'draft')
       RETURNING *`,
      [companyId, transferNumber, source_warehouse_id, destination_warehouse_id, notes || null]
    );

    const transfer = transferResult.rows[0];

    for (const item of items) {
      await query(
        `INSERT INTO stock_transfer_items (company_id, transfer_id, product_id, quantity, unit_cost, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [companyId, transfer.id, item.product_id, item.quantity, item.unit_cost || 0, item.notes || null]
      );
    }

    return successResponse(transfer, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
