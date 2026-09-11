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
      where += ` AND (key ILIKE $${paramIndex} OR name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const allowedSort = ['created_at', 'name', 'key'];
    const sortColumn = allowedSort.includes(requestedSort) ? requestedSort : 'created_at';

    const { rows } = await query(
      `SELECT * FROM veterinary_species ${where}
       ORDER BY ${sortColumn} ${order === 'desc' ? 'DESC' : 'ASC'}
       OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      [...params, offset, limit]
    );

    const { rows: countRows } = await query(`SELECT COUNT(*) FROM veterinary_species ${where}`, params);
    const total = parseInt(countRows[0]?.count || '0');

    return paginatedResponse(rows, total, page, limit);
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
    const { key, name, category, common_breeds, status } = body;

    if (!key || !name) return errorResponse('Key and name are required', 400);

    const existing = await query(
      `SELECT id FROM veterinary_species WHERE company_id = $1 AND LOWER(key) = LOWER($2)`,
      [companyId, key]
    );
    if (existing.rows.length > 0) {
      return errorResponse('A species with this key already exists', 409);
    }

    const result = await query(
      `INSERT INTO veterinary_species (company_id, key, name, category, common_breeds, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [companyId, key, name, category || 'pequeños_animales', common_breeds || null, status || 'active']
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
