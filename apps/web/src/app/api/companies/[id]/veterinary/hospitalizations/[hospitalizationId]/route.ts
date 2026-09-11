import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; hospitalizationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    const { hospitalizationId } = params;

    const result = await query(
      `SELECT vh.*,
        vp.name AS patient_name, vp.species AS patient_species, vp.weight AS patient_weight,
        vc.full_name AS client_name, vc.phone AS client_phone,
        vat.full_name AS attending_vet_name,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', vhl.id, 'log_time', vhl.log_time, 'temperature_c', vhl.temperature_c,
            'heart_rate_bpm', vhl.heart_rate_bpm, 'respiratory_rate_bpm', vhl.respiratory_rate_bpm,
            'feeding', vhl.feeding, 'hydration', vhl.hydration, 'medication_given', vhl.medication_given,
            'urinated', vhl.urinated, 'defecated', vhl.defecated, 'notes', vhl.notes,
            'professional_name', (SELECT full_name FROM veterinary_professionals WHERE id = vhl.professional_id)
          )) FROM veterinary_hospitalization_logs vhl WHERE vhl.hospitalization_id = vh.id ORDER BY vhl.log_time DESC), '[]'
        ) as logs
       FROM veterinary_hospitalizations vh
       LEFT JOIN veterinary_patients vp ON vp.id = vh.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vh.client_id
       LEFT JOIN veterinary_professionals vat ON vat.id = vh.attending_vet_id
       WHERE vh.id = $1 AND vh.company_id = $2`,
      [hospitalizationId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Hospitalización no encontrada', 404);
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse('Error al obtener hospitalización', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; hospitalizationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    const { hospitalizationId } = params;
    const body = await request.json();

    const {
      patient_id, client_id, attending_vet_id, cage_number,
      admission_date, discharge_date, initial_diagnosis,
      discharge_summary, priority, status,
    } = body;

    const result = await query(
      `UPDATE veterinary_hospitalizations SET
        patient_id = COALESCE($1, patient_id),
        client_id = COALESCE($2, client_id),
        attending_vet_id = COALESCE($3, attending_vet_id),
        cage_number = $4,
        admission_date = $5,
        discharge_date = $6,
        initial_diagnosis = $7,
        discharge_summary = $8,
        priority = COALESCE($9, priority),
        status = COALESCE($10, status)
       WHERE id = $11 AND company_id = $12
       RETURNING *`,
      [patient_id || null, client_id || null, attending_vet_id || null,
       cage_number || null, admission_date || null, discharge_date || null,
       initial_diagnosis || null, discharge_summary || null,
       priority || null, status || null, hospitalizationId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Hospitalización no encontrada', 404);
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse('Error al actualizar hospitalización', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; hospitalizationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    const { hospitalizationId } = params;

    const result = await query(
      'DELETE FROM veterinary_hospitalizations WHERE id = $1 AND company_id = $2 RETURNING id',
      [hospitalizationId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Hospitalización no encontrada', 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Error al eliminar hospitalización', 500);
  }
}
