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
    const relationType = url.searchParams.get('relation_type');

    let whereClause = 'WHERE pr.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (productId) {
      whereClause += ` AND pr.product_id = $${paramIndex}`;
      params.push(productId);
      paramIndex++;
    }

    if (relationType) {
      whereClause += ` AND pr.relation_type = $${paramIndex}`;
      params.push(relationType);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR rp.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM product_relations pr
       JOIN products p ON pr.product_id = p.id
       JOIN products rp ON pr.related_product_id = rp.id
       ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT pr.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) as product,
        json_build_object('id', rp.id, 'name', rp.name, 'sku', rp.sku) as related_product
       FROM product_relations pr
       JOIN products p ON pr.product_id = p.id
       JOIN products rp ON pr.related_product_id = rp.id
       ${whereClause}
       ORDER BY pr.created_at DESC
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
    const { product_id, related_product_id, relation_type } = body;

    if (!product_id || !related_product_id || !relation_type) {
      return errorResponse('product_id, related_product_id, and relation_type are required', 400);
    }

    if (product_id === related_product_id) {
      return errorResponse('A product cannot be related to itself', 400);
    }

    const validTypes = ['upsell', 'cross_sell', 'accessory', 'alternative', 'bundle'];
    if (!validTypes.includes(relation_type)) {
      return errorResponse(`Invalid relation_type. Must be one of: ${validTypes.join(', ')}`, 400);
    }

    const existing = await query(
      `SELECT id FROM product_relations WHERE company_id = $1 AND product_id = $2 AND related_product_id = $3`,
      [companyId, product_id, related_product_id]
    );
    if (existing.rows.length > 0) {
      return errorResponse('This product relation already exists', 400);
    }

    const result = await query(
      `INSERT INTO product_relations (company_id, product_id, related_product_id, relation_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [companyId, product_id, related_product_id, relation_type]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
