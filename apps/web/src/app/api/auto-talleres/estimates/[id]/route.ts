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
      `SELECT ae.*, 
              av.plate, av.brand, av.model,
              c.nombre as client_name, c.rut as client_rut
       FROM auto_estimates ae
       LEFT JOIN auto_vehicles av ON av.id = ae.vehicle_id
       LEFT JOIN customers c ON c.id = ae.client_id
       WHERE ae.id = $1 AND ae.company_id = $2`,
      [params.id, company_id]
    );

    if (!rows[0]) {
      return errorResponse('Estimate not found', 404);
    }

    const { rows: items } = await query(
      'SELECT * FROM auto_estimate_items WHERE estimate_id = $1 AND company_id = $2 ORDER BY sort_order',
      [params.id, company_id]
    );

    return successResponse({ ...rows[0], items });
  } catch (error) {
    console.error('Error fetching estimate:', error);
    return errorResponse('Failed to fetch estimate', 500);
  }
}
