import { query } from '@/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    let whereClause = 'WHERE company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (type) { whereClause += ` AND type = $${paramIndex}`; params.push(type); paramIndex++; }

    const countResult = await query(`SELECT COUNT(*) FROM units_of_measure ${whereClause}`, params);
    const dataResult = await query(
      `SELECT * FROM units_of_measure ${whereClause} ORDER BY type, name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('UOM error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { code, name, type, base_unit, conversion_factor } = body;

    if (!code || !name || !type) return errorResponse('code, name, and type are required', 400);

    const result = await query(
      `INSERT INTO units_of_measure (company_id, code, name, type, base_unit, conversion_factor)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [companyId, code, name, type, base_unit || null, conversion_factor || 1]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Create UOM error:', err);
    return errorResponse('Internal server error', 500);
  }
}
