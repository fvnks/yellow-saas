import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const patientId = url.searchParams.get('patient_id');

    const allowedSorts: Record<string, string> = {
      created_at: 'vd.created_at',
      application_date: 'vd.application_date',
    };
    const sortColumn = allowedSorts[sort] || 'vd.created_at';

    const conditions: string[] = ['vd.company_id = $1'];
    const params: unknown[] = [companyId];
    let paramIndex = 2;

    if (search) {
      conditions.push(`(vp.name ILIKE $${paramIndex} OR vd.product_name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (patientId) {
      conditions.push(`vd.patient_id = $${paramIndex}`);
      params.push(patientId);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM veterinary_dewormings vd
       LEFT JOIN veterinary_patients vp ON vp.id = vd.patient_id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT vd.*,
        vp.name AS patient_name, vp.species AS patient_species,
        vpr.full_name AS professional_name
       FROM veterinary_dewormings vd
       LEFT JOIN veterinary_patients vp ON vp.id = vd.patient_id
       LEFT JOIN veterinary_professionals vpr ON vpr.id = vd.professional_id
       ${whereClause}
       ORDER BY ${sortColumn} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (error) {
    return errorResponse('Error al obtener desparasitaciones', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    const body = await request.json();

    const {
      patient_id, professional_id, product_name, type = 'interna',
      dose, application_date, next_due_date, notes,
    } = body;

    if (!patient_id || !product_name) {
      return errorResponse('patient_id y product_name son requeridos', 400);
    }

    const parentCheck = await query(
      'SELECT id FROM veterinary_patients WHERE id = $1 AND company_id = $2',
      [patient_id, companyId]
    );
    if (parentCheck.rows.length === 0) return errorResponse('Paciente no encontrado', 404);

    const result = await query(
      `INSERT INTO veterinary_dewormings
        (company_id, patient_id, professional_id, product_name, type, dose, application_date, next_due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [companyId, patient_id, professional_id || null, product_name, type, dose || null,
       application_date || new Date().toISOString().split('T')[0], next_due_date || null, notes || null]
    );

    return successResponse(result.rows[0], 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('foreign key')) {
      return errorResponse('El paciente especificado no existe', 400);
    }
    return errorResponse('Error al crear desparasitación', 500);
  }
}
