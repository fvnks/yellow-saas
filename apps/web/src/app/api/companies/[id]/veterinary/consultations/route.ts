import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'consultation_date'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'consultation_date';

    const { searchParams } = new URL(request.url);
    const patientIdFilter = searchParams.get('patient_id');

    let whereClause = 'WHERE c.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR cl.full_name ILIKE $${paramIndex} OR c.primary_diagnosis ILIKE $${paramIndex} OR c.reason_for_visit ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (patientIdFilter) {
      whereClause += ` AND c.patient_id = $${paramIndex}`;
      params.push(patientIdFilter);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*)
       FROM veterinary_consultations c
       LEFT JOIN veterinary_patients p ON p.id = c.patient_id
       LEFT JOIN veterinary_clients cl ON cl.id = c.client_id
       ${whereClause}`,
      params
    );

    const dataResult = await query(`
      SELECT c.*,
        json_build_object('id', p.id, 'name', p.name, 'species', p.species) as patient,
        json_build_object('id', cl.id, 'full_name', cl.full_name) as client,
        json_build_object('id', pr.id, 'full_name', pr.full_name) as professional
      FROM veterinary_consultations c
      LEFT JOIN veterinary_patients p ON p.id = c.patient_id
      LEFT JOIN veterinary_clients cl ON cl.id = c.client_id
      LEFT JOIN veterinary_professionals pr ON pr.id = c.professional_id
      ${whereClause}
      ORDER BY c.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const {
      appointment_id, patient_id, client_id, professional_id,
      reason_for_visit, anamnesis, weight_kg, temperature_c,
      heart_rate_bpm, respiratory_rate_bpm, capillary_refill_time_sec,
      mucous_membranes, body_condition, physical_exam_findings,
      primary_diagnosis, secondary_diagnoses, presumptive_diagnosis,
      treatment_plan, general_notes, status = 'completed'
    } = body;

    if (!patient_id || !client_id || !professional_id || !reason_for_visit) {
      return errorResponse('patient_id, client_id, professional_id, and reason_for_visit are required', 400);
    }

    const [patientCheck, clientCheck, professionalCheck] = await Promise.all([
      query('SELECT id FROM veterinary_patients WHERE id = $1 AND company_id = $2', [patient_id, companyId]),
      query('SELECT id FROM veterinary_clients WHERE id = $1 AND company_id = $2', [client_id, companyId]),
      query('SELECT id FROM veterinary_professionals WHERE id = $1 AND company_id = $2', [professional_id, companyId]),
    ]);
    if (patientCheck.rows.length === 0) return errorResponse('Paciente no encontrado', 404);
    if (clientCheck.rows.length === 0) return errorResponse('Cliente no encontrado', 404);
    if (professionalCheck.rows.length === 0) return errorResponse('Profesional no encontrado', 404);

    const validStatuses = ['draft', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400);

    const result = await query(
      `INSERT INTO veterinary_consultations (
        company_id, appointment_id, patient_id, client_id, professional_id,
        reason_for_visit, anamnesis, weight_kg, temperature_c,
        heart_rate_bpm, respiratory_rate_bpm, capillary_refill_time_sec,
        mucous_membranes, body_condition, physical_exam_findings,
        primary_diagnosis, secondary_diagnoses, presumptive_diagnosis,
        treatment_plan, general_notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        companyId, appointment_id || null, patient_id, client_id, professional_id,
        reason_for_visit, anamnesis || null, weight_kg || null, temperature_c || null,
        heart_rate_bpm || null, respiratory_rate_bpm || null, capillary_refill_time_sec || null,
        mucous_membranes || null, body_condition || null, physical_exam_findings || null,
        primary_diagnosis || null, secondary_diagnoses || null, presumptive_diagnosis || null,
        treatment_plan || null, general_notes || null, status
      ]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
