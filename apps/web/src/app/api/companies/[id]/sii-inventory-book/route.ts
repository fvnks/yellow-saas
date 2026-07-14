import { query } from '@/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const periodStart = url.searchParams.get('period_start');
    const periodEnd = url.searchParams.get('period_end');
    const warehouseId = url.searchParams.get('warehouse_id');

    let whereClause = 'WHERE sib.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (periodStart) {
      whereClause += ` AND sib.period_start >= $${paramIndex}`;
      params.push(periodStart);
      paramIndex++;
    }

    if (periodEnd) {
      whereClause += ` AND sib.period_end <= $${paramIndex}`;
      params.push(periodEnd);
      paramIndex++;
    }

    if (warehouseId) {
      whereClause += ` AND sib.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM sii_inventory_book sib ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT sib.*,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) as product
       FROM sii_inventory_book sib
       LEFT JOIN warehouses w ON sib.warehouse_id = w.id
       LEFT JOIN products p ON sib.product_id = p.id
       ${whereClause}
       ORDER BY sib.period_start DESC, p.name
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('SII inventory book error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { period_start, period_end, warehouse_id, product_id, opening_qty, opening_value, entries_qty, entries_value, exits_qty, exits_value, closing_qty, closing_value, cost_method } = body;

    if (!period_start || !period_end || !warehouse_id || !product_id) {
      return errorResponse('period_start, period_end, warehouse_id, and product_id are required', 400);
    }

    const validMethods = ['FIFO', 'LIFO', 'WAC', 'STANDARD'];
    if (cost_method && !validMethods.includes(cost_method)) {
      return errorResponse(`cost_method must be one of: ${validMethods.join(', ')}`, 400);
    }

    const result = await query(
      `INSERT INTO sii_inventory_book (company_id, period_start, period_end, warehouse_id, product_id, opening_qty, opening_value, entries_qty, entries_value, exits_qty, exits_value, closing_qty, closing_value, cost_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (company_id, period_start, period_end, warehouse_id, product_id)
       DO UPDATE SET
         opening_qty = EXCLUDED.opening_qty,
         opening_value = EXCLUDED.opening_value,
         entries_qty = EXCLUDED.entries_qty,
         entries_value = EXCLUDED.entries_value,
         exits_qty = EXCLUDED.exits_qty,
         exits_value = EXCLUDED.exits_value,
         closing_qty = EXCLUDED.closing_qty,
         closing_value = EXCLUDED.closing_value,
         cost_method = EXCLUDED.cost_method,
         updated_at = NOW()
       RETURNING *`,
      [companyId, period_start, period_end, warehouse_id, product_id, opening_qty || 0, opening_value || 0, entries_qty || 0, entries_value || 0, exits_qty || 0, exits_value || 0, closing_qty || 0, closing_value || 0, cost_method || 'FIFO']
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Create SII inventory book error:', err);
    return errorResponse('Internal server error', 500);
  }
}