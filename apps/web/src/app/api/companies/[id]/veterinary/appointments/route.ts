import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'appointment_date', 'appointment_time'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'appointment_date';

    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get('date');
    const statusFilter = searchParams.get('status');
    const professionalIdFilter = searchParams.get('professional_id');

    let whereClause = 'WHERE a.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR cl.full_name ILIKE $${paramIndex} OR a.reason ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (dateFilter) {
      whereClause += ` AND a.appointment_date = $${paramIndex}`;
      params.push(dateFilter);
      paramIndex++;
    }

    if (statusFilter) {
      whereClause += ` AND a.status = $${paramIndex}`;
      params.push(statusFilter);
      paramIndex++;
    }

    if (professionalIdFilter) {
      whereClause += ` AND a.professional_id = $${paramIndex}`;
      params.push(professionalIdFilter);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*)
       FROM veterinary_appointments a
       LEFT JOIN veterinary_patients p ON p.id = a.patient_id
       LEFT JOIN veterinary_clients cl ON cl.id = a.client_id
       ${whereClause}`,
      params
    );

    const dataResult = await query(`
      SELECT a.*,
        json_build_object('id', p.id, 'name', p.name, 'species', p.species) as patient,
        json_build_object('id', cl.id, 'full_name', cl.full_name) as client,
        json_build_object('id', pr.id, 'full_name', pr.full_name) as professional,
        json_build_object('id', s.id, 'name', s.name) as service,
        json_build_object('id', rm.id, 'name', rm.name) as room
      FROM veterinary_appointments a
      LEFT JOIN veterinary_patients p ON p.id = a.patient_id
      LEFT JOIN veterinary_clients cl ON cl.id = a.client_id
      LEFT JOIN veterinary_professionals pr ON pr.id = a.professional_id
      LEFT JOIN veterinary_services s ON s.id = a.service_id
      LEFT JOIN veterinary_rooms rm ON rm.id = a.room_id
      ${whereClause}
      ORDER BY a.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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
      patient_id, client_id, professional_id, service_id, room_id,
      appointment_date, appointment_time, duration_minutes = 30,
      reason, notes, status = 'agendada'
    } = body;

    if (!patient_id || !client_id || !appointment_date || !appointment_time) {
      return errorResponse('patient_id, client_id, appointment_date, and appointment_time are required', 400);
    }

    const [patientCheck, clientCheck] = await Promise.all([
      query('SELECT id FROM veterinary_patients WHERE id = $1 AND company_id = $2', [patient_id, companyId]),
      query('SELECT id FROM veterinary_clients WHERE id = $1 AND company_id = $2', [client_id, companyId]),
    ]);
    if (patientCheck.rows.length === 0) return errorResponse('Paciente no encontrado', 404);
    if (clientCheck.rows.length === 0) return errorResponse('Cliente no encontrado', 404);

    const validStatuses = ['agendada', 'confirmada', 'en_espera', 'en_atencion', 'finalizada', 'cancelada', 'no_asistio'];
    if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400);

    const result = await query(
      `INSERT INTO veterinary_appointments (
        company_id, patient_id, client_id, professional_id, service_id, room_id,
        appointment_date, appointment_time, duration_minutes, reason, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        companyId, patient_id, client_id,
        professional_id || null, service_id || null, room_id || null,
        appointment_date, appointment_time, duration_minutes,
        reason || null, notes || null, status
      ]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
