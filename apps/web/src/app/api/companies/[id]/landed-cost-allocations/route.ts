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

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const purchaseOrderId = url.searchParams.get('purchase_order_id');
    const status = url.searchParams.get('status');

    let whereClause = 'WHERE lca.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (purchaseOrderId) {
      whereClause += ` AND lca.purchase_order_id = $${paramIndex}`;
      params.push(purchaseOrderId);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND lca.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM landed_cost_allocations lca ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT lca.*,
        json_build_object('id', po.id, 'order_number', po.order_number) as purchase_order,
        (SELECT json_agg(json_build_object(
          'id', lci.id,
          'product_id', lci.product_id,
          'product_name', p.name,
          'product_sku', p.sku,
          'allocated_amount', lci.allocated_amount,
          'base_value', lci.base_value,
          'base_weight', lci.base_weight,
          'base_volume', lci.base_volume,
          'base_quantity', lci.base_quantity
        ))
         FROM landed_cost_items lci
         JOIN products p ON lci.product_id = p.id
         WHERE lci.allocation_id = lca.id) as items
       FROM landed_cost_allocations lca
       LEFT JOIN purchase_orders po ON lca.purchase_order_id = po.id
       ${whereClause}
       ORDER BY lca.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Landed cost allocations error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { purchase_order_id, cost_type, amount, currency, exchange_rate, allocation_method, description, items } = body;

    if (!purchase_order_id || !cost_type || !amount) {
      return errorResponse('purchase_order_id, cost_type, and amount are required', 400);
    }

    const validCostTypes = ['freight', 'insurance', 'customs_duty', 'handling', 'other'];
    if (!validCostTypes.includes(cost_type)) {
      return errorResponse(`cost_type must be one of: ${validCostTypes.join(', ')}`, 400);
    }

    const validMethods = ['value', 'weight', 'volume', 'quantity'];
    if (allocation_method && !validMethods.includes(allocation_method)) {
      return errorResponse(`allocation_method must be one of: ${validMethods.join(', ')}`, 400);
    }

    const poCheck = await query('SELECT id FROM purchase_orders WHERE id = $1 AND company_id = $2', [purchase_order_id, companyId]);
    if (poCheck.rows.length === 0) return errorResponse('Purchase order not found', 404);

    const result = await query(
      `INSERT INTO landed_cost_allocations (company_id, purchase_order_id, cost_type, amount, currency, exchange_rate, allocation_method, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [companyId, purchase_order_id, cost_type, amount, currency || 'CLP', exchange_rate || 1, allocation_method || 'value', description || null]
    );

    const allocation = result.rows[0];

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(
          `INSERT INTO landed_cost_items (company_id, allocation_id, product_id, allocated_amount, base_value, base_weight, base_volume, base_quantity)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [companyId, allocation.id, item.product_id, item.allocated_amount, item.base_value || null, item.base_weight || null, item.base_volume || null, item.base_quantity || null]
        );
      }
    }

    return successResponse(allocation, 201);
  } catch (err) {
    console.error('Create landed cost allocation error:', err);
    return errorResponse('Internal server error', 500);
  }
}