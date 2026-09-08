import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const result = await query('SELECT * FROM vehicle_brands WHERE is_active = true ORDER BY name ASC');
    return successResponse(result.rows);
  } catch (err) {
    return errorResponse('Error al obtener marcas', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name) return errorResponse('Nombre de marca requerido', 400);
    
    const result = await query(
      'INSERT INTO vehicle_brands (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING *',
      [name]
    );
    
    return successResponse(result.rows[0]);
  } catch (err) {
    return errorResponse('Error al crear marca', 500);
  }
}
