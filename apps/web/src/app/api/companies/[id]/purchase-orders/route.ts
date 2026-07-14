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

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const supplier = url.searchParams.get('supplier');

    const params: any[] = [companyId];
    let where = 'WHERE po.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND po.number ILIKE $${paramIndex}`;
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
        (SELECT json_agg(json_build_object(
          'id', poi.id, 'product_id', poi.product_id, 'variant_id', poi.variant_id, 'quantity', poi.quantity,
          'received_quantity', poi.received_quantity, 'unit_price', poi.unit_price,
          'discount_percent', poi.discount_percent, 'discount_amount', poi.discount_amount,
          'tax_rate', poi.tax_rate, 'tax_amount', poi.tax_amount, 'line_total', poi.line_total, 'notes', poi.notes,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = poi.product_id)
        )) FROM purchase_order_items poi WHERE poi.order_id = po.id) as items
       FROM purchase_orders po
       ${where}
       ORDER BY po.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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
      supplier_id, warehouse_id, order_date, expected_date,
      payment_terms, notes, internal_notes, items,
    } = body;

    if (!supplier_id || !warehouse_id || !items?.length) {
      return errorResponse('Supplier, warehouse, and items are required', 400);
    }

    const { rows: countRows } = await query(
      `SELECT COUNT(*) as count FROM purchase_orders WHERE company_id = $1`,
      [companyId]
    );
    const orderNumber = `OC-${String((parseInt(countRows[0]?.count || '0') + 1)).padStart(6, '0')}`;

    let subtotal = 0;
    let taxAmount = 0;
    for (const item of items) {
      const lineSubtotal = item.quantity * item.unit_price - (item.discount_amount || 0);
      const lineTax = lineSubtotal * ((item.tax_rate || 0) / 100);
      subtotal += lineSubtotal;
      taxAmount += lineTax;
    }

    const { rows: orderRows } = await query(
      `INSERT INTO purchase_orders (company_id, supplier_id, warehouse_id, number, status, order_date, expected_date, payment_terms, subtotal, tax_amount, total_amount, notes, internal_notes)
       VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        companyId, supplier_id, warehouse_id, orderNumber,
        order_date || new Date().toISOString(), expected_date || null,
        payment_terms || 0, subtotal, taxAmount, subtotal + taxAmount,
        notes || null, internal_notes || null,
      ]
    );

    const order = orderRows[0];

    const orderItems = items.map((item: Record<string, unknown>, index: number) => {
      const taxRate = Number(item.tax_rate) || 0;
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      const discountAmount = Number(item.discount_amount) || 0;
      return {
        order_id: order.id,
        company_id: companyId,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity,
        received_quantity: 0,
        unit_price: unitPrice,
        discount_percent: item.discount_percent || 0,
        discount_amount: discountAmount,
        tax_rate: taxRate,
        tax_amount: taxRate > 0 ? (quantity * unitPrice - discountAmount) * (taxRate / 100) : 0,
        notes: item.notes || null,
        sort_order: index,
      };
    });

    for (const oi of orderItems) {
      await query(
        `INSERT INTO purchase_order_items (order_id, company_id, product_id, variant_id, quantity, received_quantity, unit_price, discount_percent, discount_amount, tax_rate, tax_amount, notes, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [oi.order_id, oi.company_id, oi.product_id, oi.variant_id, oi.quantity,
         oi.received_quantity, oi.unit_price, oi.discount_percent, oi.discount_amount,
         oi.tax_rate, oi.tax_amount, oi.notes, oi.sort_order]
      );
    }

    return successResponse({ ...order, items: orderItems }, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}