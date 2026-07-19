import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);

    let whereClause = 'WHERE company_id = $1 AND is_active = true';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR code ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM cost_centers ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT cc.*,
        (SELECT COUNT(*) FROM products p WHERE p.cost_center_id = cc.id) as product_count,
        (SELECT COUNT(*) FROM projects pr WHERE pr.cost_center_id = cc.id) as project_count,
        (SELECT COUNT(*) FROM stock_movements sm WHERE sm.cost_center_id = cc.id) as movement_count
       FROM cost_centers cc
       ${whereClause}
       ORDER BY cc.${sort || 'name'} ${(order || 'asc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
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
    const { code, name, description, parent_id } = body;

    if (!code || !name) {
      return errorResponse('Code and name are required', 400);
    }

    const existing = await query(
      'SELECT id FROM cost_centers WHERE company_id = $1 AND code = $2',
      [companyId, code]
    );
    if (existing.rows.length > 0) {
      return errorResponse('Cost center code already exists', 400);
    }

    const result = await query(
      `INSERT INTO cost_centers (company_id, code, name, description, parent_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [companyId, code, name, description || null, parent_id || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
