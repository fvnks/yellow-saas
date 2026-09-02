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
      `SELECT * FROM auto_work_order_items 
       WHERE work_order_id = $1 AND company_id = $2 
       ORDER BY sort_order`,
      [params.id, company_id]
    );

    return successResponse(rows);
  } catch (error) {
    console.error('Error fetching order items:', error);
    return errorResponse('Failed to fetch order items', 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { company_id, work_order_id, item_type, description, quantity, unit_price, discount_pct, subtotal } = body;

    const { rows } = await query(
      `INSERT INTO auto_work_order_items (
        id, company_id, work_order_id, item_type, description, quantity, unit_price, discount_pct, subtotal
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
      ) RETURNING *`,
      [company_id, work_order_id || params.id, item_type, description, quantity || 1, unit_price || 0, discount_pct || 0, subtotal || 0]
    );

    return successResponse(rows[0]);
  } catch (error) {
    console.error('Error creating order item:', error);
    return errorResponse('Failed to create order item', 500);
  }
}
