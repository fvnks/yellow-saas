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
      `SELECT v.*, 
              c.nombre as client_name, c.rut as client_rut, c.email, c.telefono,
              COUNT(wo.id) as total_orders,
              MAX(wo.created_at) as last_visit
       FROM auto_vehicles v
       LEFT JOIN customers c ON c.id = v.client_id
       LEFT JOIN auto_work_orders wo ON wo.vehicle_id = v.id AND wo.company_id = v.company_id
       WHERE v.id = $1 AND v.company_id = $2
       GROUP BY v.id, c.id`,
      [params.id, company_id]
    );

    if (!rows[0]) {
      return errorResponse('Vehicle not found', 404);
    }

    return successResponse(rows[0]);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return errorResponse('Failed to fetch vehicle', 500);
  }
}

export async function PUT(
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

    const excludedKeys = new Set(['id', 'company_id', 'created_at']);
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 2;

    for (const key of Object.keys(body)) {
      if (!excludedKeys.has(key) && body[key] !== undefined) {
        setClauses.push(`${key} = $${idx++}`);
        values.push(body[key]);
      }
    }

    const { rows } = await query(
      `UPDATE auto_vehicles SET ${setClauses}, updated_at = NOW()
       WHERE id = $${values.length} AND company_id = $${values.length + 1}
       RETURNING *`,
      values
    );

    if (!rows[0]) {
      return errorResponse('Vehicle not found or update failed', 404);
    }

    return successResponse(rows[0]);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return errorResponse('Failed to update vehicle', 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const company_id = url.searchParams.get('company_id');

    if (!company_id) {
      return errorResponse('company_id is required', 400);
    }

    await query(
      'DELETE FROM auto_vehicles WHERE id = $1 AND company_id = $2',
      [params.id, company_id]
    );

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return errorResponse('Failed to delete vehicle', 500);
  }
}
