import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'test_name', 'flag'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';
    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id');

    const params: any[] = [companyId];
    let where = 'WHERE vlr.company_id = $1';
    let paramIndex = 2;

    if (orderId) {
      where += ` AND vlr.order_id = $${paramIndex}`;
      params.push(orderId);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM veterinary_lab_results vlr ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    const dataResult = await query(
      `SELECT vlr.*
       FROM veterinary_lab_results vlr
       ${where}
       ORDER BY vlr.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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
    const { results } = body;

    if (!results?.length) {
      const { order_id, test_id, test_name, value, unit, reference_range, flag, note } = body;

      if (!order_id || !test_name) return errorResponse('Order ID and test name are required', 400);

      const orderCheck = await query(
        'SELECT id FROM veterinary_lab_orders WHERE id = $1 AND company_id = $2',
        [order_id, companyId]
      );
      if (orderCheck.rows.length === 0) return errorResponse('Orden de laboratorio no encontrada', 404);

      if (flag) {
        const validFlags = ['bajo', 'normal', 'alto', 'critico'];
        if (!validFlags.includes(flag)) return errorResponse('Invalid flag', 400);
      }

      const result = await query(
        `INSERT INTO veterinary_lab_results (company_id, order_id, test_id, test_name, value, unit, reference_range, flag, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [companyId, order_id, test_id || null, test_name, value || null, unit || null, reference_range || null, flag || null, note || null]
      );

      return successResponse(result.rows[0], 201);
    }

    const insertedResults: any[] = [];
    for (const r of results) {
      if (!r.order_id || !r.test_name) return errorResponse('Each result must have order_id and test_name', 400);

      const orderCheck = await query(
        'SELECT id FROM veterinary_lab_orders WHERE id = $1 AND company_id = $2',
        [r.order_id, companyId]
      );
      if (orderCheck.rows.length === 0) return errorResponse(`Orden de laboratorio no encontrada para resultado '${r.test_name}'`, 404);

      if (r.flag) {
        const validFlags = ['bajo', 'normal', 'alto', 'critico'];
        if (!validFlags.includes(r.flag)) return errorResponse(`Invalid flag '${r.flag}' for test '${r.test_name}'`, 400);
      }

      const { rows } = await query(
        `INSERT INTO veterinary_lab_results (company_id, order_id, test_id, test_name, value, unit, reference_range, flag, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [companyId, r.order_id, r.test_id || null, r.test_name, r.value || null, r.unit || null, r.reference_range || null, r.flag || null, r.note || null]
      );
      insertedResults.push(rows[0]);
    }

    return successResponse(insertedResults, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
