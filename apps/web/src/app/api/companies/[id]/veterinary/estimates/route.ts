import { query, transaction } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'issue_date', 'total', 'estimate_number', 'status'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const params: any[] = [companyId];
    let where = 'WHERE ve.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND (ve.estimate_number ILIKE $${paramIndex} OR vp.name ILIKE $${paramIndex} OR vc.full_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      where += ` AND ve.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM veterinary_estimates ve
       LEFT JOIN veterinary_patients vp ON vp.id = ve.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = ve.client_id
       ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    const dataResult = await query(
      `SELECT ve.*,
        (SELECT json_build_object('id', vp.id, 'name', vp.name, 'species', vp.species)) as patient,
        (SELECT json_build_object('id', vc.id, 'full_name', vc.full_name, 'rut', vc.rut)) as client,
        (SELECT json_build_object('id', vepr.id, 'full_name', vepr.full_name)) as professional,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', vei.id, 'description', vei.description, 'quantity', vei.quantity,
            'unit_price', vei.unit_price, 'subtotal', vei.subtotal, 'sort_order', vei.sort_order
          ) ORDER BY vei.sort_order) FROM veterinary_estimate_items vei WHERE vei.estimate_id = ve.id), '[]'
        ) as items
       FROM veterinary_estimates ve
       LEFT JOIN veterinary_patients vp ON vp.id = ve.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = ve.client_id
       LEFT JOIN veterinary_professionals vepr ON vepr.id = ve.professional_id
       ${where}
       ORDER BY ve.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, total, page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const {
      patient_id, client_id, professional_id, issue_date, valid_until,
      currency = 'CLP', subtotal = 0, iva_pct = 19, total = 0,
      status = 'borrador', note, items = []
    } = body;

    if (!patient_id || !client_id) return errorResponse('Patient and client are required', 400);

    const validCurrencies = ['CLP', 'UF'];
    if (!validCurrencies.includes(currency)) return errorResponse('Invalid currency', 400);

    const validStatuses = ['borrador', 'pendiente_aprobacion', 'aprobado', 'rechazado', 'expirado', 'convertido'];
    if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400);

    const result = await transaction(async (client) => {
      const { rows: numRows } = await client.query(
        `SELECT 'PPT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(COALESCE(MAX(NULLIF(SUBSTRING(estimate_number FROM 9), '')::int), 0) + 1, 4, '0') as estimate_number
         FROM veterinary_estimates WHERE company_id = $1 AND estimate_number LIKE 'PPT-' || TO_CHAR(NOW(), 'YYYY') || '-%'`,
        [companyId]
      );
      const estimateNumber = numRows[0].estimate_number;

      const { rows: estimateRows } = await client.query(
        `INSERT INTO veterinary_estimates (company_id, estimate_number, patient_id, client_id, professional_id, issue_date, valid_until, currency, subtotal, iva_pct, total, status, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [companyId, estimateNumber, patient_id, client_id, professional_id || null,
         issue_date || null, valid_until || null, currency, subtotal, iva_pct, total, status, note || null]
      );

      const estimate = estimateRows[0];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemSubtotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
        await client.query(
          `INSERT INTO veterinary_estimate_items (company_id, estimate_id, description, quantity, unit_price, subtotal, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [companyId, estimate.id, item.description, item.quantity || 0, item.unit_price || 0, itemSubtotal, item.sort_order || i]
        );
      }

      return estimate;
    });

    return successResponse(result, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
