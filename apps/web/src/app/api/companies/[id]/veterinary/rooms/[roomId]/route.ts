import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; roomId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      'SELECT * FROM veterinary_rooms WHERE id = $1 AND company_id = $2',
      [params.roomId, companyId]
    );

    if (!rows[0]) return errorResponse('Room not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch room', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; roomId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, type, capacity, status } = body;

    if (type) {
      const validTypes = ['box', 'quirofano', 'hospitalizacion', 'laboratorio', 'peluqueria'];
      if (!validTypes.includes(type)) return errorResponse('Invalid room type', 400);
    }

    const { rows } = await query(
      `UPDATE veterinary_rooms SET
        name = COALESCE($1, name), type = COALESCE($2, type),
        capacity = COALESCE($3, capacity), status = COALESCE($4, status)
       WHERE id = $5 AND company_id = $6
       RETURNING *`,
      [name || null, type || null, capacity || null, status || null, params.roomId, companyId]
    );

    if (!rows[0]) return errorResponse('Room not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update room', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; roomId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: appointments } = await query(
      `SELECT id FROM veterinary_appointments WHERE room_id = $1 AND company_id = $2 AND status NOT IN ('cancelada', 'finalizada') LIMIT 1`,
      [params.roomId, companyId]
    );

    if (appointments.length > 0) {
      return errorResponse('Cannot delete room with active appointments', 400);
    }

    await query(
      'DELETE FROM veterinary_rooms WHERE id = $1 AND company_id = $2',
      [params.roomId, companyId]
    );

    return successResponse({ message: 'Room deleted successfully' });
  } catch {
    return errorResponse('Failed to delete room', 500);
  }
}
