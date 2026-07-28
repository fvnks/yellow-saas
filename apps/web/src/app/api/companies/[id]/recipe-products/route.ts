import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, offset } = parseSearchParams(request);

    let whereClause = 'WHERE rp.company_id = $1';
    const queryParams: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (rp.name ILIKE $${paramIndex} OR rp.sku ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM recipe_products rp ${whereClause}`,
      queryParams
    );

    const dataResult = await query(
      `SELECT rp.*
       FROM recipe_products rp
       ${whereClause}
       ORDER BY rp.name ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, sku, unit_of_measure, cost_price, sale_price, description } = body;

    if (!name || !sku) return errorResponse('Nombre y SKU son requeridos', 400);

    const { rows } = await query(
      `INSERT INTO recipe_products (company_id, name, sku, unit_of_measure, cost_price, sale_price, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (company_id, sku) DO UPDATE SET
         name = EXCLUDED.name, unit_of_measure = EXCLUDED.unit_of_measure,
         cost_price = EXCLUDED.cost_price, sale_price = EXCLUDED.sale_price,
         description = EXCLUDED.description, updated_at = NOW()
       RETURNING *`,
      [companyId, name, sku, unit_of_measure || 'UN', cost_price || 0, sale_price || 0, description || null]
    );

    return successResponse(rows[0], 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
