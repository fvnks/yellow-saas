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

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'order_number', 'status', 'total', 'order_date', 'id'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const customer = url.searchParams.get('customer');

    const params: any[] = [companyId];
    let where = 'WHERE so.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND so.order_number ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      where += ` AND so.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (customer) {
      where += ` AND so.customer_id = $${paramIndex}`;
      params.push(customer);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as count FROM sales_orders so ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT so.*,
        (SELECT json_build_object('id', c.id, 'name', c.name, 'tax_id', c.tax_id) FROM customers c WHERE c.id = so.customer_id) as customer,
        (SELECT json_build_object('id', w.id, 'name', w.name, 'code', w.code) FROM warehouses w WHERE w.id = so.warehouse_id) as warehouse,
        (SELECT json_agg(json_build_object(
          'id', soi.id, 'product_id', soi.product_id, 'quantity', soi.quantity,
          'unit_price', soi.unit_price, 'discount_percent', soi.discount_percent,
          'tax_rate', soi.tax_rate, 'line_total', soi.line_total,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = soi.product_id)
        )) FROM sales_order_items soi WHERE soi.order_id = so.id) as items
       FROM sales_orders so
       ${where}
       ORDER BY so.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(rows, total, page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const {
      customer_id, warehouse_id, order_date, delivery_date,
      payment_terms, notes, items, project_id,
    } = body;

    if (!customer_id || !warehouse_id || !items?.length) {
      return errorResponse('Customer, warehouse, and items are required', 400);
    }

    const { rows: countRows } = await query(
      `SELECT COUNT(*) as count FROM sales_orders WHERE company_id = $1`,
      [companyId]
    );
    const orderNumber = `OV-${String((parseInt(countRows[0]?.count || '0') + 1)).padStart(6, '0')}`;

    let subtotal = 0;
    let taxAmount = 0;
    for (const item of items) {
      const lineSubtotal = item.quantity * item.unit_price - (item.discount_amount || 0);
      const lineTax = lineSubtotal * ((item.tax_rate || 0) / 100);
      subtotal += lineSubtotal;
      taxAmount += lineTax;
    }

    const { rows: orderRows } = await query(
      `INSERT INTO sales_orders (company_id, customer_id, warehouse_id, order_number, status, order_date, delivery_date, payment_terms, subtotal, tax_amount, total, notes, project_id)
       VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        companyId, customer_id, warehouse_id, orderNumber,
        order_date || new Date().toISOString(), delivery_date || null,
        payment_terms || 0, subtotal, taxAmount, subtotal + taxAmount,
        notes || null, project_id || null,
      ]
    );

    const order = orderRows[0];

    const orderItems = items.map((item: Record<string, unknown>) => {
      const taxRate = Number(item.tax_rate) || 0;
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      return {
        order_id: order.id,
        company_id: companyId,
        product_id: item.product_id,
        quantity,
        unit_price: unitPrice,
        discount_percent: item.discount_percent || 0,
        tax_rate: taxRate,
      };
    });

    for (const oi of orderItems) {
      await query(
        `INSERT INTO sales_order_items (order_id, company_id, product_id, quantity, unit_price, discount_percent, tax_rate)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [oi.order_id, oi.company_id, oi.product_id, oi.quantity, oi.unit_price, oi.discount_percent, oi.tax_rate]
      );
    }

    return successResponse({ ...order, items: orderItems }, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}