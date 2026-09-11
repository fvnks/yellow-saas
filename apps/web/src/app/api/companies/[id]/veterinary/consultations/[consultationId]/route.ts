import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; consultationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(`
      SELECT c.*,
        json_build_object('id', p.id, 'name', p.name, 'species', p.species, 'breed', p.breed, 'date_of_birth', p.date_of_birth) as patient,
        json_build_object('id', cl.id, 'full_name', cl.full_name, 'phone', cl.phone, 'email', cl.email) as client,
        json_build_object('id', pr.id, 'full_name', pr.full_name, 'specialty', pr.specialty) as professional
      FROM veterinary_consultations c
      LEFT JOIN veterinary_patients p ON p.id = c.patient_id
      LEFT JOIN veterinary_clients cl ON cl.id = c.client_id
      LEFT JOIN veterinary_professionals pr ON pr.id = c.professional_id
      WHERE c.id = $1 AND c.company_id = $2
    `, [params.consultationId, companyId]);

    if (!rows[0]) return errorResponse('Consultation not found', 404);

    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to fetch consultation', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; consultationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const {
      appointment_id, patient_id, client_id, professional_id,
      reason_for_visit, anamnesis, weight_kg, temperature_c,
      heart_rate_bpm, respiratory_rate_bpm, capillary_refill_time_sec,
      mucous_membranes, body_condition, physical_exam_findings,
      primary_diagnosis, secondary_diagnoses, presumptive_diagnosis,
      treatment_plan, general_notes, status
    } = body;

    if (status) {
      const validStatuses = ['draft', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400);
    }

    const { rows } = await query(
      `UPDATE veterinary_consultations SET
        appointment_id = $1, patient_id = COALESCE($2, patient_id), client_id = COALESCE($3, client_id),
        professional_id = COALESCE($4, professional_id), reason_for_visit = COALESCE($5, reason_for_visit),
        anamnesis = $6, weight_kg = $7, temperature_c = $8,
        heart_rate_bpm = $9, respiratory_rate_bpm = $10, capillary_refill_time_sec = $11,
        mucous_membranes = $12, body_condition = $13, physical_exam_findings = $14,
        primary_diagnosis = $15, secondary_diagnoses = $16, presumptive_diagnosis = $17,
        treatment_plan = $18, general_notes = $19, status = COALESCE($20, status)
       WHERE id = $21 AND company_id = $22
       RETURNING *`,
      [
        appointment_id !== undefined ? appointment_id : undefined,
        patient_id || null, client_id || null, professional_id || null,
        reason_for_visit || null,
        anamnesis !== undefined ? anamnesis : undefined,
        weight_kg !== undefined ? weight_kg : undefined,
        temperature_c !== undefined ? temperature_c : undefined,
        heart_rate_bpm !== undefined ? heart_rate_bpm : undefined,
        respiratory_rate_bpm !== undefined ? respiratory_rate_bpm : undefined,
        capillary_refill_time_sec !== undefined ? capillary_refill_time_sec : undefined,
        mucous_membranes !== undefined ? mucous_membranes : undefined,
        body_condition !== undefined ? body_condition : undefined,
        physical_exam_findings !== undefined ? physical_exam_findings : undefined,
        primary_diagnosis !== undefined ? primary_diagnosis : undefined,
        secondary_diagnoses !== undefined ? secondary_diagnoses : undefined,
        presumptive_diagnosis !== undefined ? presumptive_diagnosis : undefined,
        treatment_plan !== undefined ? treatment_plan : undefined,
        general_notes !== undefined ? general_notes : undefined,
        status || null,
        params.consultationId, companyId
      ]
    );

    if (!rows[0]) return errorResponse('Consultation not found', 404);

    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to update consultation', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; consultationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      'DELETE FROM veterinary_consultations WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.consultationId, companyId]
    );

    if (!rows[0]) return errorResponse('Consultation not found', 404);

    return successResponse({ message: 'Consultation deleted successfully' });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to delete consultation', 500);
  }
}
