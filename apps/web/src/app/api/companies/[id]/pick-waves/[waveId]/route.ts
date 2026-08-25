import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; waveId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT pw.*,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        json_build_object('id', u.id, 'full_name', u.full_name) as assigned_user,
        (SELECT json_agg(json_build_object(
          'id', pt.id,
          'order_id', pt.order_id,
          'order_number', so.order_number,
          'delivery_guide_id', pt.delivery_guide_id,
          'delivery_guide_number', dg.guide_number,
          'product_id', pt.product_id,
          'product_name', p.name,
          'product_sku', p.sku,
          'zone_id', pt.zone_id,
          'zone_name', wz.name,
          'shelf_id', pt.shelf_id,
          'shelf_name', ws.name,
          'position_id', pt.position_id,
          'position_code', wp.code,
          'quantity_requested', pt.quantity_requested,
          'quantity_picked', pt.quantity_picked,
          'status', pt.status,
          'assigned_to', pt.assigned_to,
          'sequence', pt.sequence,
          'started_at', pt.started_at,
          'completed_at', pt.completed_at
        ) ORDER BY pt.sequence)
         FROM pick_tasks pt
         LEFT JOIN sales_orders so ON pt.order_id = so.id
         LEFT JOIN delivery_guides dg ON pt.delivery_guide_id = dg.id
         LEFT JOIN products p ON pt.product_id = p.id
         LEFT JOIN warehouse_zones wz ON pt.zone_id = wz.id
         LEFT JOIN warehouse_shelves ws ON pt.shelf_id = ws.id
         LEFT JOIN warehouse_positions wp ON pt.position_id = wp.id
         WHERE pt.wave_id = pw.id) as tasks
       FROM pick_waves pw
       LEFT JOIN warehouses w ON pw.warehouse_id = w.id
       LEFT JOIN profiles u ON pw.assigned_to = u.id
       WHERE pw.id = $1 AND pw.company_id = $2`,
      [params.waveId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Pick wave not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Get pick wave error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; waveId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { priority, assigned_to, status, notes } = body;

    const validStatuses = ['draft', 'released', 'in_progress', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(`status must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const result = await query(
      `UPDATE pick_waves SET
        priority = COALESCE($1, priority),
        assigned_to = COALESCE($2, assigned_to),
        status = COALESCE($3, status),
        notes = COALESCE($4, notes),
        updated_at = NOW()
       WHERE id = $5 AND company_id = $6
       RETURNING *`,
      [priority, assigned_to, status, notes, params.waveId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Pick wave not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Update pick wave error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; waveId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const waveCheck = await query('SELECT status FROM pick_waves WHERE id = $1 AND company_id = $2', [params.waveId, companyId]);
    if (waveCheck.rows.length === 0) return errorResponse('Pick wave not found', 404);
    if (waveCheck.rows[0].status !== 'draft') {
      return errorResponse('Can only delete draft waves', 400);
    }

    await query('DELETE FROM pick_tasks WHERE wave_id = $1 AND company_id = $2', [params.waveId, companyId]);
    const result = await query(
      'DELETE FROM pick_waves WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.waveId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Pick wave not found', 404);

    return successResponse({ message: 'Pick wave deleted successfully' });
  } catch (err) {
    console.error('Delete pick wave error:', err);
    return errorResponse('Internal server error', 500);
  }
}