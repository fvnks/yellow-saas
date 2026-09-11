import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'name', 'type'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';

    let whereClause = 'WHERE company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR type ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM veterinary_rooms ${whereClause}`,
      params
    );

    const dataResult = await query(`
      SELECT * FROM veterinary_rooms
      ${whereClause}
      ORDER BY ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { name, type = 'box', capacity = 1, status = 'active' } = body;

    if (!name) return errorResponse('Name is required', 400);

    const validTypes = ['box', 'quirofano', 'hospitalizacion', 'laboratorio', 'peluqueria'];
    if (!validTypes.includes(type)) {
      return errorResponse('Invalid room type', 400);
    }

    const result = await query(
      `INSERT INTO veterinary_rooms (company_id, name, type, capacity, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [companyId, name, type, capacity, status]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
