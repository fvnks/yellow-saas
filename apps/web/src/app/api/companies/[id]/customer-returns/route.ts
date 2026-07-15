import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { page, limit, search, offset } = parseSearchParams(request);
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const customerId = url.searchParams.get('customer_id');
    const status = url.searchParams.get('status');
    const warehouseId = url.searchParams.get('warehouse_id');

    let whereClause = 'WHERE cr.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (customerId) {
      whereClause += ` AND cr.customer_id = $${paramIndex}`;
      params.push(customerId);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND cr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (warehouseId) {
      whereClause += ` AND cr.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (c.name ILIKE $${paramIndex} OR cr.return_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM customer_returns cr
       LEFT JOIN customers c ON cr.customer_id = c.id
       ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT cr.*,
        json_build_object('id', c.id, 'name', c.name, 'tax_id', c.tax_id) as customer,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        (SELECT COUNT(*) FROM customer_return_items cri WHERE cri.return_id = cr.id) as item_count
       FROM customer_returns cr
       LEFT JOIN customers c ON cr.customer_id = c.id
       LEFT JOIN warehouses w ON cr.warehouse_id = w.id
       ${whereClause}
       ORDER BY cr.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err: any) {
    if (err?.code === '42P01') {
      return paginatedResponse([], 0, page, limit);
    }
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { customer_id, original_invoice_id, warehouse_id, reason, notes, items } = body;

    if (!customer_id || !warehouse_id || !items || items.length === 0) {
      return errorResponse('customer_id, warehouse_id, and at least one item are required', 400);
    }

    const numberResult = await query(
      `SELECT COUNT(*) FROM customer_returns WHERE company_id = $1`,
      [companyId]
    );
    const returnNumber = `DEV-${String(parseInt(numberResult.rows[0].count) + 1).padStart(5, '0')}`;

    await query('BEGIN');

    try {
      const returnResult = await query(
        `INSERT INTO customer_returns (company_id, customer_id, original_invoice_id, warehouse_id, return_number, reason, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
         RETURNING *`,
        [companyId, customer_id, original_invoice_id || null, warehouse_id, returnNumber, reason || null, notes || null]
      );

      const returnRecord = returnResult.rows[0];

      for (const item of items) {
        if (!item.product_id || !item.quantity) {
          await query('ROLLBACK');
          return errorResponse('Each item must have product_id and quantity', 400);
        }

        await query(
          `INSERT INTO customer_return_items (company_id, return_id, product_id, quantity, unit_price, restock)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            companyId, returnRecord.id, item.product_id, item.quantity,
            item.unit_price || 0, item.restock !== false,
          ]
        );
      }

      await query('COMMIT');
      return successResponse(returnRecord, 201);
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (err: any) {
    if (err?.code === '42P01') {
      return errorResponse('La tabla de devoluciones no existe. Ejecute la migración.', 500);
    }
    return errorResponse('Internal server error', 500);
  }
}
