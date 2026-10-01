import { query, transaction } from '@/api/lib/db';
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

    // Cross-tenant validation for related entities.
    const custCheck = await query(
      `SELECT id FROM customers WHERE company_id = $1 AND id = $2`,
      [companyId, customer_id],
    );
    if (custCheck.rows.length === 0) return errorResponse('Cliente no encontrado', 404);
    const whCheck = await query(
      `SELECT id FROM warehouses WHERE company_id = $1 AND id = $2`,
      [companyId, warehouse_id],
    );
    if (whCheck.rows.length === 0) return errorResponse('Bodega no encontrada', 404);
    if (original_invoice_id) {
      const invCheck = await query(
        `SELECT id FROM invoices WHERE company_id = $1 AND id = $2`,
        [companyId, original_invoice_id],
      );
      if (invCheck.rows.length === 0) return errorResponse('Factura original no encontrada', 404);
    }
    for (const item of items) {
      if (!item.product_id || !item.quantity) {
        return errorResponse('Each item must have product_id and quantity', 400);
      }
    }

    const returnRecord = await transaction(async (client) => {
      // Per-company advisory lock to avoid duplicate return numbers under concurrency.
      const lockHash = await client.query<{ h: bigint }>(
        `SELECT ('x' || substr(md5($1 || ':customer_returns:return_number'), 1, 16))::bit(64)::bigint AS h`,
        [companyId],
      );
      await client.query(`SELECT pg_advisory_xact_lock($1)`, [lockHash.rows[0].h.toString()]);

      const nres = await client.query(
        `SELECT COUNT(*)::int AS c FROM customer_returns WHERE company_id = $1`,
        [companyId],
      );
      const returnNumber = `DEV-${String((nres.rows[0].c ?? 0) + 1).padStart(5, '0')}`;

      const { rows } = await client.query(
        `INSERT INTO customer_returns (company_id, customer_id, original_invoice_id, warehouse_id, return_number, reason, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
         RETURNING *`,
        [companyId, customer_id, original_invoice_id || null, warehouse_id, returnNumber, reason || null, notes || null],
      );
      const rec = rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO customer_return_items (company_id, return_id, product_id, quantity, unit_price, restock, condition, reason)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            companyId, rec.id, item.product_id, item.quantity,
            item.unit_price || 0, item.restock !== false,
            item.condition || null, item.reason || null,
          ],
        );
      }

      return rec;
    });

    return successResponse(returnRecord, 201);
  } catch (err: any) {
    if (err?.code === '42P01') {
      return errorResponse('La tabla de devoluciones no existe. Ejecute la migración.', 500);
    }
    return errorResponse('Internal server error', 500);
  }
}
