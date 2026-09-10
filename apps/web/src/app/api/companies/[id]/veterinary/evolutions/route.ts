import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'evolution_date'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'evolution_date';

    const { searchParams } = new URL(request.url);
    const patientIdFilter = searchParams.get('patient_id');

    let whereClause = 'WHERE e.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR e.diagnosis ILIKE $${paramIndex} OR e.evolution_type ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (patientIdFilter) {
      whereClause += ` AND e.patient_id = $${paramIndex}`;
      params.push(patientIdFilter);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*)
       FROM veterinary_evolutions e
       LEFT JOIN veterinary_patients p ON p.id = e.patient_id
       ${whereClause}`,
      params
    );

    const dataResult = await query(`
      SELECT e.*,
        json_build_object('id', p.id, 'name', p.name, 'species', p.species) as patient,
        json_build_object('id', pr.id, 'full_name', pr.full_name) as professional
      FROM veterinary_evolutions e
      LEFT JOIN veterinary_patients p ON p.id = e.patient_id
      LEFT JOIN veterinary_professionals pr ON pr.id = e.professional_id
      ${whereClause}
      ORDER BY e.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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
      patient_id, consultation_id, evolution_type = 'consulta',
      subjective, objective, assessment, plan,
      weight_kg, temperature_c, heart_rate_bpm, respiratory_rate_bpm,
      professional_id, diagnosis, evolution_date, evolution_time, status = 'final'
    } = body;

    if (!patient_id) return errorResponse('patient_id is required', 400);

    const validTypes = ['consulta', 'control', 'procedimiento', 'post_operatorio', 'hospitalizacion', 'examen'];
    if (!validTypes.includes(evolution_type)) return errorResponse('Invalid evolution type', 400);

    const validStatuses = ['draft', 'final'];
    if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400);

    const result = await query(
      `INSERT INTO veterinary_evolutions (
        company_id, patient_id, consultation_id, evolution_type,
        subjective, objective, assessment, plan,
        weight_kg, temperature_c, heart_rate_bpm, respiratory_rate_bpm,
        professional_id, diagnosis, evolution_date, evolution_time, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        companyId, patient_id, consultation_id || null, evolution_type,
        subjective || null, objective || null, assessment || null, plan || null,
        weight_kg || null, temperature_c || null, heart_rate_bpm || null, respiratory_rate_bpm || null,
        professional_id || null, diagnosis || null,
        evolution_date || undefined, evolution_time || undefined, status
      ]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
