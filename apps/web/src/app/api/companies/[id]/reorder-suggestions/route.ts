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
    const warehouseId = url.searchParams.get('warehouse_id');
    const onlyCritical = url.searchParams.get('only_critical') === 'true';

    let whereClause = 'WHERE sl.company_id = $1 AND p.track_stock = true AND p.is_active = true';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (warehouseId) {
      whereClause += ` AND sl.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    if (onlyCritical) {
      whereClause += ` AND sl.available_quantity <= sl.reorder_point`;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM stock_levels sl
       JOIN products p ON sl.product_id = p.id
       ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT 
        sl.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku, 'unit_of_measure', p.unit_of_measure, 'cost_price', p.cost_price) as product,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        GREATEST(sl.reorder_point - sl.available_quantity, 0) as suggested_qty,
        GREATEST(sl.reorder_point - sl.available_quantity, 0) * p.cost_price as estimated_cost,
        sl.lead_time_days
       FROM stock_levels sl
       JOIN products p ON sl.product_id = p.id
       JOIN warehouses w ON sl.warehouse_id = w.id
       ${whereClause}
       AND (sl.reorder_point > 0 AND sl.available_quantity <= sl.reorder_point)
       ORDER BY (sl.reorder_point - sl.available_quantity) DESC, p.name
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Reorder suggestions error:', err);
    return errorResponse('Internal server error', 500);
  }
}