import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    const overdueFilter = url.searchParams.get('overdue');

    const allowedSorts: Record<string, string> = {
      due_date: 'vr.due_date',
      created_at: 'vr.created_at',
    };
    const sortColumn = allowedSorts[sort] || 'vr.created_at';

    const conditions: string[] = ['vr.company_id = $1'];
    const params: unknown[] = [companyId];
    let paramIndex = 2;

    if (search) {
      conditions.push(`(
        vr.title ILIKE $${paramIndex} OR
        vp.name ILIKE $${paramIndex} OR
        vc.full_name ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (statusFilter) {
      conditions.push(`vr.status = $${paramIndex}`);
      params.push(statusFilter);
      paramIndex++;
    }

    if (overdueFilter === 'true') {
      conditions.push(`vr.due_date < CURRENT_DATE AND vr.status = 'pending'`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM veterinary_reminders vr
       LEFT JOIN veterinary_patients vp ON vp.id = vr.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vr.client_id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT vr.*,
        vp.name AS patient_name, vp.species AS patient_species,
        vc.full_name AS client_name, vc.phone AS client_phone
       FROM veterinary_reminders vr
       LEFT JOIN veterinary_patients vp ON vp.id = vr.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vr.client_id
       ${whereClause}
       ORDER BY ${sortColumn} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (error) {
    return errorResponse('Error al obtener recordatorios', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    const body = await request.json();

    const {
      patient_id, client_id, type, due_date, title,
      description, status = 'pending',
    } = body;

    if (!patient_id || !client_id || !title || !due_date) {
      return errorResponse('patient_id, client_id, title y due_date son requeridos', 400);
    }

    const [patientCheck, clientCheck] = await Promise.all([
      query('SELECT id FROM veterinary_patients WHERE id = $1 AND company_id = $2', [patient_id, companyId]),
      query('SELECT id FROM veterinary_clients WHERE id = $1 AND company_id = $2', [client_id, companyId]),
    ]);
    if (patientCheck.rows.length === 0) return errorResponse('Paciente no encontrado', 404);
    if (clientCheck.rows.length === 0) return errorResponse('Cliente no encontrado', 404);

    const result = await query(
      `INSERT INTO veterinary_reminders
        (company_id, patient_id, client_id, type, due_date, title, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [companyId, patient_id, client_id, type || null, due_date,
       title, description || null, status]
    );

    return successResponse(result.rows[0], 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('foreign key')) {
      return errorResponse('Uno de los registros referenciados no existe', 400);
    }
    return errorResponse('Error al crear recordatorio', 500);
  }
}
