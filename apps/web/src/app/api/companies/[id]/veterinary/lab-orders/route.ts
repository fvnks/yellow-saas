import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'ordered_date', 'status', 'order_number'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const patientId = url.searchParams.get('patient_id');

    const params: any[] = [companyId];
    let where = 'WHERE vlo.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND (vlo.order_number ILIKE $${paramIndex} OR vp.name ILIKE $${paramIndex} OR vlp.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      where += ` AND vlo.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (patientId) {
      where += ` AND vlo.patient_id = $${paramIndex}`;
      params.push(patientId);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM veterinary_lab_orders vlo
       LEFT JOIN veterinary_patients vp ON vp.id = vlo.patient_id
       LEFT JOIN veterinary_lab_panels vlp ON vlp.id = vlo.panel_id
       ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    const dataResult = await query(
      `SELECT vlo.*,
        (SELECT json_build_object('id', vp.id, 'name', vp.name, 'species', vp.species)) as patient,
        (SELECT json_build_object('id', vc.id, 'full_name', vc.full_name)) as client,
        (SELECT json_build_object('id', vepr.id, 'full_name', vepr.full_name)) as professional,
        (SELECT json_build_object('id', vlp.id, 'name', vlp.name, 'code', vlp.code)) as panel,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', vlr.id, 'test_id', vlr.test_id, 'test_name', vlr.test_name, 'value', vlr.value,
            'unit', vlr.unit, 'reference_range', vlr.reference_range, 'flag', vlr.flag, 'note', vlr.note
          )) FROM veterinary_lab_results vlr WHERE vlr.order_id = vlo.id), '[]'
        ) as results
       FROM veterinary_lab_orders vlo
       LEFT JOIN veterinary_patients vp ON vp.id = vlo.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vlo.client_id
       LEFT JOIN veterinary_professionals vepr ON vepr.id = vlo.professional_id
       LEFT JOIN veterinary_lab_panels vlp ON vlp.id = vlo.panel_id
       ${where}
       ORDER BY vlo.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, total, page, limit);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const {
      patient_id, client_id, professional_id, panel_id, ordered_date,
      sampling_date, sample_type = 'sangre', external_lab, priority = 'rutina',
      status = 'ordenada', notes
    } = body;

    if (!patient_id || !client_id || !panel_id) return errorResponse('Patient, client, and panel are required', 400);

    const [patientCheck, clientCheck, panelCheck] = await Promise.all([
      query('SELECT id FROM veterinary_patients WHERE id = $1 AND company_id = $2', [patient_id, companyId]),
      query('SELECT id FROM veterinary_clients WHERE id = $1 AND company_id = $2', [client_id, companyId]),
      query('SELECT id FROM veterinary_lab_panels WHERE id = $1 AND company_id = $2', [panel_id, companyId]),
    ]);
    if (patientCheck.rows.length === 0) return errorResponse('Paciente no encontrado', 404);
    if (clientCheck.rows.length === 0) return errorResponse('Cliente no encontrado', 404);
    if (panelCheck.rows.length === 0) return errorResponse('Panel de laboratorio no encontrado', 404);

    const validSampleTypes = ['sangre', 'orina', 'heces', 'raspado_piel', 'frotis_sanguineo', 'aspiracion', 'otro'];
    if (!validSampleTypes.includes(sample_type)) return errorResponse('Invalid sample type', 400);

    const validPriorities = ['rutina', 'urgencia', 'estatica'];
    if (!validPriorities.includes(priority)) return errorResponse('Invalid priority', 400);

    const validStatuses = ['ordenada', 'muestra_tomada', 'en_proceso', 'resultados_listos', 'entregado', 'cancelada'];
    if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400);

    const { rows: numRows } = await query(
      `SELECT 'LAB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(COALESCE(MAX(NULLIF(SUBSTRING(order_number FROM 6), '')::int), 0) + 1, 4, '0') as order_number
       FROM veterinary_lab_orders WHERE company_id = $1 AND order_number LIKE 'LAB-' || TO_CHAR(NOW(), 'YYYY') || '-%'`,
      [companyId]
    );
    const orderNumber = numRows[0].order_number;

    const result = await query(
      `INSERT INTO veterinary_lab_orders (company_id, order_number, patient_id, client_id, professional_id, panel_id, ordered_date, sampling_date, sample_type, external_lab, priority, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [companyId, orderNumber, patient_id, client_id, professional_id || null, panel_id,
       ordered_date || null, sampling_date || null, sample_type, external_lab || null,
       priority, status, notes || null]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
