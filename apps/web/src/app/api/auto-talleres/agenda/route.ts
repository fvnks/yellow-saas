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
      appointment_date,
      start_time,
      end_time,
      appointment_type,
      status,
      notes,
    } = body;

    if (!company_id || !vehicle_id || !client_id || !appointment_date || !start_time || !end_time) {
      return errorResponse('Required fields: company_id, vehicle_id, client_id, appointment_date, start_time, end_time', 400);
    }

    const { rows } = await query(
      `INSERT INTO auto_appointments (
        id, company_id, vehicle_id, client_id, technician_id, bay_id,
        appointment_date, start_time, end_time, appointment_type, status, notes
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *`,
      [
        company_id,
        vehicle_id,
        client_id,
        technician_id || null,
        bay_id || null,
        appointment_date,
        start_time,
        end_time,
        appointment_type || 'reparacion',
        status || 'agendado',
        notes || null,
      ]
    );

    return successResponse(rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return errorResponse('Failed to create appointment', 500);
  }
}
