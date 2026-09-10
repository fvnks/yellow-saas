import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);

    let where = 'WHERE company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      where += ` AND (name ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const allowedSort = ['created_at', 'name', 'price_clp', 'category'];
    const sortColumn = allowedSort.includes(requestedSort) ? requestedSort : 'created_at';

    const { rows } = await query(
      `SELECT * FROM veterinary_services ${where}
       ORDER BY ${sortColumn} ${order === 'desc' ? 'DESC' : 'ASC'}
       OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      [...params, offset, limit]
    );

    const { rows: countRows } = await query(`SELECT COUNT(*) FROM veterinary_services ${where}`, params);
    const total = parseInt(countRows[0]?.count || '0');

    return paginatedResponse(rows, total, page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description, category, price_clp, duration_minutes, requires_consent, status } = body;

    if (!name) return errorResponse('Name is required', 400);

    if (category && !['consulta', 'vacunacion', 'desparasitacion', 'cirugia', 'hospitalizacion', 'examen', 'imagenologia', 'peluqueria', 'otro'].includes(category)) {
      return errorResponse('Invalid category', 400);
    }

    const result = await query(
      `INSERT INTO veterinary_services (company_id, name, description, category, price_clp, duration_minutes, requires_consent, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        companyId, name, description || null, category || 'consulta',
        price_clp || 0, duration_minutes || 30, requires_consent || false, status || 'active'
      ]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
