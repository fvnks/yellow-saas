import { NextResponse } from 'next/server';
import { query } from '@/app/api/lib/db';
import { successResponse, errorResponse } from '@/app/api/lib/helpers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const company_id = url.searchParams.get('company_id');

    if (!company_id) {
      return errorResponse('company_id is required', 400);
    }

    const { rows } = await query(
      `SELECT wo.*,
              av.plate, av.brand, av.model, av.year, av.color,
              c.nombre as client_name, c.rut as client_rut, c.email, c.telefono,
              at.full_name as technician_name, at.specialization
       FROM auto_work_orders wo
       LEFT JOIN auto_vehicles av ON av.id = wo.vehicle_id
       LEFT JOIN customers c ON c.id = wo.client_id
       LEFT JOIN auto_technicians at ON at.id = wo.service_writer_id
       WHERE wo.id = $1 AND wo.company_id = $2`,
      [params.id, company_id]
    );

    if (!rows[0]) {
      return errorResponse('Order not found', 404);
    }

    return successResponse(rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    return errorResponse('Failed to fetch order', 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const company_id = url.searchParams.get('company_id');

    if (!company_id) {
      return errorResponse('company_id is required', 400);
    }

    const {
      status,
      notes,
      vehicle_id,
      bay_id,
      priority,
      customer_complaint,
      diagnosis,
      service_writer_id,
      estimated_completion_date,
    } = body;

    const validStatuses = [
      'checkin', 'diagnostic', 'estimated', 'approved', 'waiting_parts',
      'in_progress', 'quality_check', 'ready', 'delivered', 'invoiced', 'cancelled'
    ];
    if (status !== undefined && !validStatuses.includes(status)) {
      return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const validPriorities = ['baja', 'normal', 'alta', 'urgente'];
    if (priority !== undefined && !validPriorities.includes(priority)) {
      return errorResponse(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`, 400);
    }

    const setClauses: string[] = [];
    const values: any[] = [params.id, company_id];
    let paramIdx = 2;

    const addClause = (field: string, value: any) => {
      paramIdx++;
      setClauses.push(`${field} = $${paramIdx}`);
      values.push(value);
    };

    if (status !== undefined) addClause('status', status);
    if (notes !== undefined) addClause('notes', notes);
    if (vehicle_id !== undefined) addClause('vehicle_id', vehicle_id || null);
    if (bay_id !== undefined) addClause('bay_id', bay_id || null);
    if (priority !== undefined) addClause('priority', priority);
    if (customer_complaint !== undefined) addClause('customer_complaint', customer_complaint);
    if (diagnosis !== undefined) addClause('diagnosis', diagnosis);
    if (service_writer_id !== undefined) addClause('service_writer_id', service_writer_id || null);
    if (estimated_completion_date !== undefined) addClause('estimated_completion_date', estimated_completion_date || null);

    if (setClauses.length === 0) {
      return errorResponse('No fields to update', 400);
    }

    const { rows } = await query(
      `UPDATE auto_work_orders
       SET ${setClauses.join(', ')}, updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      values
    );

    if (!rows[0]) {
      return errorResponse('Order not found or update failed', 404);
    }

    return successResponse(rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    return errorResponse('Failed to update order', 500);
  }
}

