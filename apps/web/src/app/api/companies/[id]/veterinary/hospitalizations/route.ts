import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');

    const allowedSorts: Record<string, string> = {
      created_at: 'vh.created_at',
      admission_date: 'vh.admission_date',
    };
    const sortColumn = allowedSorts[sort] || 'vh.created_at';

    const conditions: string[] = ['vh.company_id = $1'];
    const params: unknown[] = [companyId];
    let paramIndex = 2;

    if (search) {
      conditions.push(`(
        vp.name ILIKE $${paramIndex} OR
        vh.cage_number ILIKE $${paramIndex} OR
        vh.initial_diagnosis ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (statusFilter) {
      conditions.push(`vh.status = $${paramIndex}`);
      params.push(statusFilter);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM veterinary_hospitalizations vh
       LEFT JOIN veterinary_patients vp ON vp.id = vh.patient_id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

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
       ${whereClause}
       ORDER BY ${sortColumn} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (error) {
    return errorResponse('Error al obtener hospitalizaciones', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    const body = await request.json();

    const {
      patient_id, client_id, attending_vet_id, cage_number,
      admission_date, discharge_date, initial_diagnosis,
      discharge_summary, priority = 'media', status = 'active',
    } = body;

    if (!patient_id || !client_id || !attending_vet_id) {
      return errorResponse('patient_id, client_id y attending_vet_id son requeridos', 400);
    }

    const [patientCheck, clientCheck] = await Promise.all([
      query('SELECT id FROM veterinary_patients WHERE id = $1 AND company_id = $2', [patient_id, companyId]),
      query('SELECT id FROM veterinary_clients WHERE id = $1 AND company_id = $2', [client_id, companyId]),
    ]);
    if (patientCheck.rows.length === 0) return errorResponse('Paciente no encontrado', 404);
    if (clientCheck.rows.length === 0) return errorResponse('Cliente no encontrado', 404);

    const result = await query(
      `INSERT INTO veterinary_hospitalizations
        (company_id, patient_id, client_id, attending_vet_id, cage_number,
         admission_date, discharge_date, initial_diagnosis,
         discharge_summary, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [companyId, patient_id, client_id, attending_vet_id, cage_number || null,
       admission_date || new Date().toISOString(), discharge_date || null,
       initial_diagnosis || null, discharge_summary || null, priority, status]
    );

    return successResponse(result.rows[0], 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('foreign key')) {
      return errorResponse('Uno de los registros referenciados no existe', 400);
    }
    return errorResponse('Error al crear hospitalización', 500);
  }
}
