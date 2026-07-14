import { query } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const parentProductId = url.searchParams.get('parent_product_id');
    const componentProductId = url.searchParams.get('component_product_id');

    let whereClause = 'WHERE pb.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (parentProductId) {
      whereClause += ` AND pb.parent_product_id = $${paramIndex}`;
      params.push(parentProductId);
      paramIndex++;
    }

    if (componentProductId) {
      whereClause += ` AND pb.component_product_id = $${paramIndex}`;
      params.push(componentProductId);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex} OR c.sku ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM product_boms pb
       JOIN products p ON pb.parent_product_id = p.id
       JOIN products c ON pb.component_product_id = c.id
       ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT pb.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku, 'unit_of_measure', p.unit_of_measure, 'cost_price', p.cost_price) as parent_product,
        json_build_object('id', c.id, 'name', c.name, 'sku', c.sku, 'unit_of_measure', c.unit_of_measure, 'cost_price', c.cost_price) as component_product
       FROM product_boms pb
       JOIN products p ON pb.parent_product_id = p.id
       JOIN products c ON pb.component_product_id = c.id
       ${whereClause}
       ORDER BY pb.sort_order, p.name
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Product BOMs error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { parent_product_id, component_product_id, quantity, unit_of_measure, scrap_percent, is_optional, sort_order } = body;

    if (!parent_product_id || !component_product_id) {
      return errorResponse('parent_product_id and component_product_id are required', 400);
    }

    if (parent_product_id === component_product_id) {
      return errorResponse('A product cannot be a component of itself', 400);
    }

    const parentCheck = await query('SELECT id FROM products WHERE id = $1 AND company_id = $2', [parent_product_id, companyId]);
    const componentCheck = await query('SELECT id FROM products WHERE id = $1 AND company_id = $2', [component_product_id, companyId]);

    if (parentCheck.rows.length === 0 || componentCheck.rows.length === 0) {
      return errorResponse('Product not found', 404);
    }

    const result = await query(
      `INSERT INTO product_boms (company_id, parent_product_id, component_product_id, quantity, unit_of_measure, scrap_percent, is_optional, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [companyId, parent_product_id, component_product_id, quantity || 1, unit_of_measure || 'UN', scrap_percent || 0, is_optional || false, sort_order || 0]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Create BOM error:', err);
    if (err instanceof Error && err.message.includes('duplicate key')) {
      return errorResponse('This component already exists for this product', 400);
    }
    return errorResponse('Internal server error', 500);
  }
}