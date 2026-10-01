import { query, transaction } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
  nextDocumentNumber,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'order_number', 'status', 'total_amount', 'order_date', 'id'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const supplier = url.searchParams.get('supplier');

    const params: any[] = [companyId];
    let where = 'WHERE po.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND po.order_number ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      where += ` AND po.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (supplier) {
      where += ` AND po.supplier_id = $${paramIndex}`;
      params.push(supplier);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as count FROM purchase_orders po ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT po.*,
        (SELECT json_build_object('id', s.id, 'name', s.name, 'tax_id', s.tax_id) FROM suppliers s WHERE s.id = po.supplier_id) as supplier,
        (SELECT json_build_object('id', w.id, 'name', w.name, 'code', w.code) FROM warehouses w WHERE w.id = po.warehouse_id) as warehouse,
        (SELECT json_build_object('id', pj.id, 'name', pj.name, 'code', pj.code) FROM projects pj WHERE pj.id = po.project_id) as project,
        (SELECT json_agg(json_build_object(
          'id', poi.id, 'product_id', poi.product_id, 'quantity', poi.quantity,
          'received_quantity', poi.received_quantity, 'unit_price', poi.unit_price,
          'discount_percent', poi.discount_percent,
          'tax_rate', poi.tax_rate, 'line_total', poi.line_total,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = poi.product_id)
        ) ORDER BY poi.created_at) FROM purchase_order_items poi WHERE poi.order_id = po.id) as items
       FROM purchase_orders po
       ${where}
       ORDER BY po.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(rows, total, page, limit);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const {
      supplier_id, warehouse_id, order_date, expected_date,
      payment_terms, notes, items, project_id,
    } = body;

    if (!supplier_id || !warehouse_id || !items?.length) {
      return errorResponse('Supplier, warehouse, and items are required', 400);
    }

    // Validate foreign entities belong to the same tenant (cross-tenant guard).
    const supplierCheck = await query(
      `SELECT id FROM suppliers WHERE company_id = $1 AND id = $2`,
      [companyId, supplier_id],
    );
    if (supplierCheck.rows.length === 0) return errorResponse('Proveedor no encontrado', 404);
    const warehouseCheck = await query(
      `SELECT id FROM warehouses WHERE company_id = $1 AND id = $2`,
      [companyId, warehouse_id],
    );
    if (warehouseCheck.rows.length === 0) return errorResponse('Bodega no encontrada', 404);
    if (project_id) {
      const projCheck = await query(
        `SELECT id FROM projects WHERE company_id = $1 AND id = $2`,
        [companyId, project_id],
      );
      if (projCheck.rows.length === 0) return errorResponse('Proyecto no encontrado', 404);
    }

    const result = await transaction(async (client) => {
      // Take a per-(company,table) advisory lock so concurrent inserts cannot
      // observe the same COUNT(*) and produce duplicate order_numbers.
      const lockHash = await client.query<{ h: bigint }>(
        `SELECT ('x' || substr(md5($1 || ':purchase_orders:order_number'), 1, 16))::bit(64)::bigint AS h`,
        [companyId],
      );
      await client.query(`SELECT pg_advisory_xact_lock($1)`, [lockHash.rows[0].h.toString()]);

      const { rows: globalCount } = await client.query(
        `SELECT COUNT(*)::int AS c FROM purchase_orders WHERE company_id = $1`,
        [companyId],
      );
      const ocNumber = `OC-${String((globalCount[0].c ?? 0) + 1).padStart(6, '0')}`;

      let subtotal = 0;
      let taxAmount = 0;
      for (const item of items) {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const discountPct = Number(item.discount_percent) || 0;
        const lineSubtotal = quantity * unitPrice;
        const discountAmount = lineSubtotal * (discountPct / 100);
        const taxRate = Number(item.tax_rate) || 19;
        const lineTax = (lineSubtotal - discountAmount) * (taxRate / 100);
        subtotal += lineSubtotal - discountAmount;
        taxAmount += lineTax;
      }

      const { rows: orderRows } = await client.query(
        `INSERT INTO purchase_orders (company_id, supplier_id, warehouse_id, order_number, status, order_date, expected_date, payment_terms, subtotal, tax_amount, total, notes, project_id)
         VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          companyId, supplier_id, warehouse_id, ocNumber,
          order_date || new Date().toISOString(), expected_date || null,
          payment_terms || 0, subtotal, taxAmount, subtotal + taxAmount,
          notes || null, project_id || null,
        ],
      );

      const order = orderRows[0];

      const orderItems = items.map((item: Record<string, unknown>, index: number) => {
        const taxRate = Number(item.tax_rate) || 0;
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        return {
          order_id: order.id,
          company_id: companyId,
          product_id: item.product_id,
          quantity,
          received_quantity: 0,
          unit_price: unitPrice,
          discount_percent: item.discount_percent || 0,
          tax_rate: taxRate,
          _index: index,
        };
      });

      for (const oi of orderItems) {
        await client.query(
          `INSERT INTO purchase_order_items (order_id, company_id, product_id, quantity, received_quantity, unit_price, discount_percent, tax_rate)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [oi.order_id, oi.company_id, oi.product_id, oi.quantity,
           oi.received_quantity, oi.unit_price, oi.discount_percent, oi.tax_rate],
        );
      }

      return { ...order, items: orderItems };
    });

    return successResponse(result, 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}