import { NextResponse } from 'next/server';
import { query } from '@/app/api/lib/db';
import { successResponse, errorResponse } from '@/app/api/lib/helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      company_id,
      vehicle_id,
      client_id,
      technician_id,
      bay_id,
      status,
      priority,
      customer_complaint,
      notes,
      subtotal,
      iva,
      total,
    } = body;

    if (!company_id || !vehicle_id || !client_id) {
      return errorResponse('company_id, vehicle_id and client_id are required', 400);
    }

    const order_number = `OT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

    const { rows } = await query(
      `INSERT INTO auto_work_orders (
        id, company_id, order_number, vehicle_id, client_id, service_writer_id, bay_id,
        status, priority, customer_complaint, notes, subtotal, iva_amount, total
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *`,
      [
        company_id,
        order_number,
        vehicle_id,
        client_id,
        technician_id || null,
        bay_id || null,
        status || 'checkin',
        priority || 'normal',
        customer_complaint || null,
        notes || null,
        subtotal || 0,
        iva || 0,
        total || 0,
      ]
    );

    return successResponse(rows[0]);
  } catch (error) {
    console.error('Error creating order:', error);
    return errorResponse('Failed to create order', 500);
  }
}
