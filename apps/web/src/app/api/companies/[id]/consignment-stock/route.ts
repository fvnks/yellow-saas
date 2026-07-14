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
    const supplierId = url.searchParams.get('supplier_id');
    const warehouseId = url.searchParams.get('warehouse_id');
    const productId = url.searchParams.get('product_id');
    const status = url.searchParams.get('status');

    let whereClause = 'WHERE cs.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (supplierId) {
      whereClause += ` AND cs.supplier_id = $${paramIndex}`;
      params.push(supplierId);
      paramIndex++;
    }

    if (warehouseId) {
      whereClause += ` AND cs.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    if (productId) {
      whereClause += ` AND cs.product_id = $${paramIndex}`;
      params.push(productId);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND cs.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM consignment_stock cs ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT cs.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) as product,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        json_build_object('id', s.id, 'name', s.name) as supplier
       FROM consignment_stock cs
       LEFT JOIN products p ON cs.product_id = p.id
       LEFT JOIN warehouses w ON cs.warehouse_id = w.id
       LEFT JOIN suppliers s ON cs.supplier_id = s.id
       ${whereClause}
       ORDER BY cs.received_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Consignment stock error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { supplier_id, warehouse_id, product_id, quantity, unit_cost, received_at, agreement_id } = body;

    if (!supplier_id || !warehouse_id || !product_id || !quantity) {
      return errorResponse('supplier_id, warehouse_id, product_id, and quantity are required', 400);
    }

    const result = await query(
      `INSERT INTO consignment_stock (company_id, supplier_id, warehouse_id, product_id, quantity, unit_cost, agreement_id, received_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'in_stock')
       RETURNING *`,
      [companyId, supplier_id, warehouse_id, product_id, quantity, unit_cost || 0, agreement_id || null, received_at || new Date().toISOString()]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Create consignment stock error:', err);
    return errorResponse('Internal server error', 500);
  }
}