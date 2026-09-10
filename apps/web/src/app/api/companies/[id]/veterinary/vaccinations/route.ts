import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'application_date'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'application_date';

    const { searchParams } = new URL(request.url);
    const patientIdFilter = searchParams.get('patient_id');

    let whereClause = 'WHERE v.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR v.vaccine_name ILIKE $${paramIndex} OR v.batch_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (patientIdFilter) {
      whereClause += ` AND v.patient_id = $${paramIndex}`;
      params.push(patientIdFilter);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*)
       FROM veterinary_vaccinations v
       LEFT JOIN veterinary_patients p ON p.id = v.patient_id
       ${whereClause}`,
      params
    );

    const dataResult = await query(`
      SELECT v.*,
        json_build_object('id', p.id, 'name', p.name, 'species', p.species) as patient,
        json_build_object('id', pr.id, 'full_name', pr.full_name) as professional
      FROM veterinary_vaccinations v
      LEFT JOIN veterinary_patients p ON p.id = v.patient_id
      LEFT JOIN veterinary_professionals pr ON pr.id = v.professional_id
      ${whereClause}
      ORDER BY v.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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
      patient_id, professional_id, consultation_id, vaccine_name,
      manufacturer, batch_number, application_date, next_due_date,
      dose, notes
    } = body;

    if (!patient_id || !vaccine_name || !application_date) {
      return errorResponse('patient_id, vaccine_name, and application_date are required', 400);
    }

    const result = await query(
      `INSERT INTO veterinary_vaccinations (
        company_id, patient_id, professional_id, consultation_id, vaccine_name,
        manufacturer, batch_number, application_date, next_due_date, dose, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        companyId, patient_id, professional_id || null, consultation_id || null,
        vaccine_name, manufacturer || null, batch_number || null,
        application_date, next_due_date || null, dose || null, notes || null
      ]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
