import { query } from '../../../lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, offset } = parseSearchParams(request);

    let whereClause = 'WHERE pt.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND pt.name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM product_tags pt ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT pt.*,
        (SELECT COUNT(*) FROM product_tag_products WHERE tag_id = pt.id) as product_count
       FROM product_tags pt
       ${whereClause}
       ORDER BY pt.name ASC
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
    const { name, color } = body;

    if (!name) return errorResponse('Name is required', 400);

    const existing = await query(
      `SELECT id FROM product_tags WHERE company_id = $1 AND LOWER(name) = LOWER($2)`,
      [companyId, name]
    );
    if (existing.rows.length > 0) {
      return errorResponse('A tag with this name already exists', 400);
    }

    const result = await query(
      `INSERT INTO product_tags (company_id, name, color)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [companyId, name, color || '#6366f1']
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
