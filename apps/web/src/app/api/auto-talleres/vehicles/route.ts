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
      'SELECT * FROM auto_vehicles WHERE company_id = $1 ORDER BY created_at DESC',
      [company_id]
    );

    return successResponse(rows);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return errorResponse('Failed to fetch vehicles', 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      company_id,
      client_id,
      plate,
      brand,
      model,
      year,
      color,
      fuel_type,
      transmission,
      mileage,
      engine_capacity,
      vin,
      observation,
    } = body;

    if (!company_id || !plate || !brand || !model || !year || !client_id) {
      return errorResponse('Required fields: company_id, plate, brand, model, year, client_id', 400);
    }

    const { rows } = await query(
      `INSERT INTO auto_vehicles (
        id, company_id, client_id, plate, brand, model, year, color,
        fuel_type, transmission, mileage, engine_capacity, vin, observation
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *`,
      [
        company_id,
        client_id,
        plate,
        brand,
        model,
        year,
        color || null,
        fuel_type || 'naftero',
        transmission || 'manual',
        mileage || 0,
        engine_capacity || null,
        vin || null,
        observation || null,
      ]
    );

    return successResponse(rows[0]);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return errorResponse('Failed to create vehicle', 500);
  }
}
