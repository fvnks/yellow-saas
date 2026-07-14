import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, offset } = parseSearchParams(request);

    let whereClause = 'WHERE t.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (t.name ILIKE $${paramIndex} OR t.code ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM taxes t ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT t.*,
        (SELECT COUNT(*) FROM products WHERE tax_id = t.id) as product_count
       FROM taxes t
       ${whereClause}
       ORDER BY t.name ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, code, rate, type, sri_code, is_active } = body;

    if (!name || rate === undefined) return errorResponse('Name and rate are required', 400);

    const existing = await query(
      `SELECT id FROM taxes WHERE company_id = $1 AND LOWER(name) = LOWER($2)`,
      [companyId, name]
    );
    if (existing.rows.length > 0) {
      return errorResponse('A tax with this name already exists', 400);
    }

    const result = await query(
      `INSERT INTO taxes (company_id, name, code, rate, type, sri_code, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [companyId, name, code || null, rate, type || 'iva', sri_code || null, is_active !== false]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
