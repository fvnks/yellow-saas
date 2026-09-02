import { NextResponse } from 'next/server';
import { query } from '@/app/api/lib/db';
import { successResponse, errorResponse } from '@/app/api/lib/helpers';

export async function GET(request: Request) {
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
       WHERE ae.company_id = $1
       ORDER BY ae.created_at DESC`,
      [company_id]
    );

    return successResponse(rows);
  } catch (error) {
    console.error('Error fetching estimates:', error);
    return errorResponse('Failed to fetch estimates', 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      company_id,
      vehicle_id,
      client_id,
      issue_date,
      valid_until,
      subtotal,
      iva,
      total,
      client_notes,
      shop_terms,
      items,
    } = body;

    if (!company_id || !vehicle_id || !client_id) {
      return errorResponse('Required: company_id, vehicle_id, client_id', 400);
    }

    const estimate_number = `EST-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

    const { rows } = await query(
      `INSERT INTO auto_estimates (
        id, company_id, estimate_number, vehicle_id, client_id,
        issue_date, valid_until, subtotal, iva_amount, total,
        client_notes, shop_terms, status
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'borrador'
      ) RETURNING *`,
      [
        company_id,
        estimate_number,
        vehicle_id,
        client_id,
        issue_date,
        valid_until,
        subtotal,
        iva,
        total,
        client_notes || null,
        shop_terms || null,
      ]
    );

    const estimate = rows[0];

    if (items && items.length > 0) {
      for (const item of items) {
        await query(
          `INSERT INTO auto_estimate_items (
            id, company_id, estimate_id, item_type, description, quantity,
            unit_price, discount_pct, subtotal
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )`,
          [
            company_id,
            estimate.id,
            item.item_type,
            item.description,
            item.quantity || 1,
            item.unit_price || 0,
            item.discount_pct || 0,
            item.subtotal || 0,
          ]
        );
      }
    }

    return successResponse({ ...estimate, items });
  } catch (error) {
    console.error('Error creating estimate:', error);
    return errorResponse('Failed to create estimate', 500);
  }
}
