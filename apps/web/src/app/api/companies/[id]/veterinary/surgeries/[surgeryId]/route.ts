import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; surgeryId: string } }
) {
  try {
    const companyId = getCompanyId(request);
    const { surgeryId } = params;

    const result = await query(
      `SELECT vs.*,
        vp.name AS patient_name, vp.species AS patient_species,
        vc.full_name AS client_name,
        vsurgeon.full_name AS surgeon_name,
        van.full_name AS anesthetist_name,
        vr.name AS room_name
       FROM veterinary_surgeries vs
       LEFT JOIN veterinary_patients vp ON vp.id = vs.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vs.client_id
       LEFT JOIN veterinary_professionals vsurgeon ON vsurgeon.id = vs.surgeon_id
       LEFT JOIN veterinary_professionals van ON van.id = vs.anesthetist_id
       LEFT JOIN veterinary_surgery_rooms vr ON vr.id = vs.room_id
       WHERE vs.id = $1 AND vs.company_id = $2`,
      [surgeryId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Cirugía no encontrada', 404);
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse('Error al obtener cirugía', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; surgeryId: string } }
) {
  try {
    const companyId = getCompanyId(request);
    const { surgeryId } = params;
    const body = await request.json();

    const {
      patient_id, client_id, surgeon_id, anesthetist_id, surgery_name,
      scheduled_date, room_id, pre_op_evaluation, surgery_report,
      post_op_instructions, status,
    } = body;

    const result = await query(
      `UPDATE veterinary_surgeries SET
        patient_id = COALESCE($1, patient_id),
        client_id = COALESCE($2, client_id),
        surgeon_id = COALESCE($3, surgeon_id),
        anesthetist_id = $4,
        surgery_name = COALESCE($5, surgery_name),
        scheduled_date = $6,
        room_id = $7,
        pre_op_evaluation = $8,
        surgery_report = $9,
        post_op_instructions = $10,
        status = COALESCE($11, status)
       WHERE id = $12 AND company_id = $13
       RETURNING *`,
      [patient_id || null, client_id || null, surgeon_id || null,
       anesthetist_id || null, surgery_name || null, scheduled_date || null,
       room_id || null, pre_op_evaluation || null, surgery_report || null,
       post_op_instructions || null, status || null, surgeryId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Cirugía no encontrada', 404);
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse('Error al actualizar cirugía', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; surgeryId: string } }
) {
  try {
    const companyId = getCompanyId(request);
    const { surgeryId } = params;

    const result = await query(
      'DELETE FROM veterinary_surgeries WHERE id = $1 AND company_id = $2 RETURNING id',
      [surgeryId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Cirugía no encontrada', 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Error al eliminar cirugía', 500);
  }
}
