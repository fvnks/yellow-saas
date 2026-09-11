import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'paid_at', 'amount', 'status'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const estimateId = url.searchParams.get('estimate_id');
    const clientId = url.searchParams.get('client_id');

    const params: any[] = [companyId];
    let where = 'WHERE vp.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND (vp.patient_name ILIKE $${paramIndex} OR vc.full_name ILIKE $${paramIndex} OR vp.concept ILIKE $${paramIndex} OR vp.reference_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      where += ` AND vp.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (estimateId) {
      where += ` AND vp.estimate_id = $${paramIndex}`;
      params.push(estimateId);
      paramIndex++;
    }

    if (clientId) {
      where += ` AND vp.client_id = $${paramIndex}`;
      params.push(clientId);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM veterinary_payments vp
       LEFT JOIN veterinary_patients vpt ON vpt.id = vp.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vp.client_id
       ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    const dataResult = await query(
      `SELECT vp.*,
        (SELECT json_build_object('id', vpt.id, 'name', vpt.name)) as patient,
        (SELECT json_build_object('id', vc.id, 'full_name', vc.full_name)) as client
       FROM veterinary_payments vp
       LEFT JOIN veterinary_patients vpt ON vpt.id = vp.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vp.client_id
       ${where}
       ORDER BY vp.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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
      estimate_id, patient_id, client_id, paid_at, amount,
      method = 'efectivo', concept, reference_number, status = 'completado'
    } = body;

    if (!patient_id || !client_id) return errorResponse('Patient and client are required', 400);
    if (!amount || Number(amount) <= 0) return errorResponse('Amount must be greater than 0', 400);

    const [patientCheck, clientCheck] = await Promise.all([
      query('SELECT id FROM veterinary_patients WHERE id = $1 AND company_id = $2', [patient_id, companyId]),
      query('SELECT id FROM veterinary_clients WHERE id = $1 AND company_id = $2', [client_id, companyId]),
    ]);
    if (patientCheck.rows.length === 0) return errorResponse('Paciente no encontrado', 404);
    if (clientCheck.rows.length === 0) return errorResponse('Cliente no encontrado', 404);

    if (estimate_id) {
      const estimateCheck = await query('SELECT id FROM veterinary_estimates WHERE id = $1 AND company_id = $2', [estimate_id, companyId]);
      if (estimateCheck.rows.length === 0) return errorResponse('Presupuesto no encontrado', 404);
    }

    const validMethods = ['efectivo', 'debito', 'credito_webpay', 'transbank_credito', 'transferencia', 'cheque', 'mercadopago'];
    if (!validMethods.includes(method)) return errorResponse('Invalid payment method', 400);

    const validStatuses = ['completado', 'pendiente', 'reverso'];
    if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400);

    const result = await query(
      `INSERT INTO veterinary_payments (company_id, estimate_id, patient_id, client_id, paid_at, amount, method, concept, reference_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [companyId, estimate_id || null, patient_id, client_id, paid_at || null, amount, method, concept || null, reference_number || null, status]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
