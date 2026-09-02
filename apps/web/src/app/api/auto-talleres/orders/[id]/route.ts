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
              av.patente, av.brand, av.model, av.year, av.color,
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
