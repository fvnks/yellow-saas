import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'name', 'code', 'city', 'region', 'is_active', 'id'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';

    let whereClause = 'WHERE company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR code ILIKE $${paramIndex} OR city ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM warehouses ${whereClause}`,
      params
    );

    const dataResult = await query(`
      SELECT * FROM warehouses
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

    const {
      name,
      code,
      address,
      city,
      region,
      country = 'CL',
      postal_code,
      phone,
      email,
      is_default = false,
      is_active = true,
    } = body;

    if (!name || !code) {
      return errorResponse('Name and code are required', 400);
    }

    const existing = await query(
      'SELECT id FROM warehouses WHERE company_id = $1 AND code = $2',
      [companyId, code]
    );
    if (existing.rows.length > 0) {
      return errorResponse('Ya existe una bodega con este código', 409);
    }

    const result = await query(
      `INSERT INTO warehouses (
        company_id, name, code, address, city, region, country, postal_code,
        phone, email, is_default, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        companyId,
        name,
        code,
        address || null,
        city || null,
        region || null,
        country,
        postal_code || null,
        phone || null,
        email || null,
        is_default,
        is_active,
      ]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
