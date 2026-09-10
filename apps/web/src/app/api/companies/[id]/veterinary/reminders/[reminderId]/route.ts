import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; reminderId: string } }
) {
  try {
    const companyId = getCompanyId(request);
    const { reminderId } = params;

    const result = await query(
      `SELECT vr.*,
        vp.name AS patient_name, vp.species AS patient_species,
        vc.full_name AS client_name, vc.phone AS client_phone
       FROM veterinary_reminders vr
       LEFT JOIN veterinary_patients vp ON vp.id = vr.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vr.client_id
       WHERE vr.id = $1 AND vr.company_id = $2`,
      [reminderId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Recordatorio no encontrado', 404);
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse('Error al obtener recordatorio', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; reminderId: string } }
) {
  try {
    const companyId = getCompanyId(request);
    const { reminderId } = params;
    const body = await request.json();

    const {
      patient_id, client_id, type, due_date, title,
      description, status,
    } = body;

    const result = await query(
      `UPDATE veterinary_reminders SET
        patient_id = COALESCE($1, patient_id),
        client_id = COALESCE($2, client_id),
        type = COALESCE($3, type),
        due_date = COALESCE($4, due_date),
        title = COALESCE($5, title),
        description = $6,
        status = COALESCE($7, status)
       WHERE id = $8 AND company_id = $9
       RETURNING *`,
      [patient_id || null, client_id || null, type || null,
       due_date || null, title || null,
       description !== undefined ? description : null,
       status || null, reminderId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Recordatorio no encontrado', 404);
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse('Error al actualizar recordatorio', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; reminderId: string } }
) {
  try {
    const companyId = getCompanyId(request);
    const { reminderId } = params;

    const result = await query(
      'DELETE FROM veterinary_reminders WHERE id = $1 AND company_id = $2 RETURNING id',
      [reminderId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Recordatorio no encontrado', 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Error al eliminar recordatorio', 500);
  }
}
