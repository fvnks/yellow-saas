import { query } from '../../../../../../lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '../../../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const waveId = url.searchParams.get('wave_id');
    const warehouseId = url.searchParams.get('warehouse_id');
    const status = url.searchParams.get('status');
    const assignedTo = url.searchParams.get('assigned_to');
    const productId = url.searchParams.get('product_id');

    let whereClause = 'WHERE pt.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (waveId) {
      whereClause += ` AND pt.wave_id = $${paramIndex}`;
      params.push(waveId);
      paramIndex++;
    }

    if (warehouseId) {
      whereClause += ` AND pt.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND pt.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (assignedTo) {
      whereClause += ` AND pt.assigned_to = $${paramIndex}`;
      params.push(assignedTo);
      paramIndex++;
    }

    if (productId) {
      whereClause += ` AND pt.product_id = $${paramIndex}`;
      params.push(productId);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM pick_tasks pt ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT pt.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) as product,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        json_build_object('id', wz.id, 'name', wz.name, 'code', wz.code) as zone,
        json_build_object('id', ws.id, 'name', ws.name) as shelf,
        json_build_object('id', wp.id, 'code', wp.code) as position,
        json_build_object('id', u.id, 'full_name', u.full_name) as assigned_user
       FROM pick_tasks pt
       LEFT JOIN products p ON pt.product_id = p.id
       LEFT JOIN warehouses w ON pt.warehouse_id = w.id
       LEFT JOIN warehouse_zones wz ON pt.zone_id = wz.id
       LEFT JOIN warehouse_shelves ws ON pt.shelf_id = ws.id
       LEFT JOIN warehouse_positions wp ON pt.position_id = wp.id
       LEFT JOIN profiles u ON pt.assigned_to = u.id
       ${whereClause}
       ORDER BY pt.sequence
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Pick tasks error:', err);
    return errorResponse('Internal server error', 500);
  }
}