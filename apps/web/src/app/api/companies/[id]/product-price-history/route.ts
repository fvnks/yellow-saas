import { query } from '@/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const productId = url.searchParams.get('product_id');

    let whereClause = 'WHERE pph.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (productId) {
      whereClause += ` AND pph.product_id = $${paramIndex}`;
      params.push(productId);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND p.name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM product_price_history pph
       JOIN products p ON pph.product_id = p.id
       ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT pph.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) as product
       FROM product_price_history pph
       JOIN products p ON pph.product_id = p.id
       ${whereClause}
       ORDER BY pph.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
