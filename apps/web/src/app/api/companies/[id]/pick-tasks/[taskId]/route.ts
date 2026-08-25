import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
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
       WHERE pt.id = $1 AND pt.company_id = $2`,
      [params.taskId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Pick task not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Get pick task error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { quantity_picked, status, assigned_to, started_at, completed_at } = body;

    const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'short', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(`status must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const result = await query(
      `UPDATE pick_tasks SET
        quantity_picked = COALESCE($1, quantity_picked),
        status = COALESCE($2, status),
        assigned_to = COALESCE($3, assigned_to),
        started_at = COALESCE($4, started_at),
        completed_at = COALESCE($5, completed_at),
        updated_at = NOW()
       WHERE id = $6 AND company_id = $7
       RETURNING *`,
      [quantity_picked, status, assigned_to, started_at, completed_at, params.taskId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Pick task not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Update pick task error:', err);
    return errorResponse('Internal server error', 500);
  }
}