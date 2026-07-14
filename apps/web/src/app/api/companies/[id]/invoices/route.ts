import { query } from '@/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const customer = url.searchParams.get('customer');

    const params: any[] = [companyId];
    let where = 'WHERE i.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND (i.number ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      where += ` AND i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (customer) {
      where += ` AND i.customer_id = $${paramIndex}`;
      params.push(customer);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) as count FROM invoices i LEFT JOIN customers c ON c.id = i.customer_id ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT i.*,
        (SELECT json_build_object('id', c.id, 'name', c.name, 'tax_id', c.tax_id) FROM customers c WHERE c.id = i.customer_id) as customer,
        (SELECT json_build_object('id', w.id, 'name', w.name, 'code', w.code) FROM warehouses w WHERE w.id = i.warehouse_id) as warehouse,
        (SELECT json_build_object('id', so.id, 'number', so.number) FROM sales_orders so WHERE so.id = i.sales_order_id) as sales_order,
        (SELECT json_agg(json_build_object(
          'id', ii.id, 'product_id', ii.product_id, 'quantity', ii.quantity, 'unit_price', ii.unit_price,
          'discount_percent', ii.discount_percent, 'discount_amount', ii.discount_amount,
          'tax_rate', ii.tax_rate, 'tax_amount', ii.tax_amount, 'line_total', ii.line_total, 'notes', ii.notes,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = ii.product_id)
        )) FROM invoice_items ii WHERE ii.invoice_id = i.id) as items
       FROM invoices i
       ${where}
       ORDER BY i.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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
      customer_id, warehouse_id, sales_order_id, invoice_date,
      due_date, payment_terms, notes, items,
    } = body;

    if (!customer_id || !warehouse_id || !items?.length) {
      return errorResponse('Customer, warehouse, and items are required', 400);
    }

    const { rows: countRows } = await query(
      `SELECT COUNT(*) as count FROM invoices WHERE company_id = $1`,
      [companyId]
    );
    const invoiceNumber = `FE-${String((parseInt(countRows[0]?.count || '0') + 1)).padStart(6, '0')}`;

    // Check stock for each item
    for (const item of items) {
      const { rows: stockRows } = await query(
        `SELECT quantity FROM stock_levels WHERE company_id = $1 AND product_id = $2 AND warehouse_id = $3`,
        [companyId, item.product_id, warehouse_id]
      );

      if (!stockRows[0] || stockRows[0].quantity < item.quantity) {
        return errorResponse(
          `Stock insuficiente para ${item.product_name || item.product_id}. Disponible: ${stockRows[0]?.quantity || 0}`,
          400
        );
      }
    }

    let subtotal = 0;
    let taxAmount = 0;
    for (const item of items) {
      const lineSubtotal = item.quantity * item.unit_price - (item.discount_amount || 0);
      const lineTax = lineSubtotal * ((item.tax_rate || 0) / 100);
      subtotal += lineSubtotal;
      taxAmount += lineTax;
    }

    const { rows: invoiceRows } = await query(
      `INSERT INTO invoices (company_id, customer_id, warehouse_id, sales_order_id, number, status, invoice_date, due_date, payment_terms, subtotal, tax_amount, total_amount, notes)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        companyId, customer_id, warehouse_id, sales_order_id || null, invoiceNumber,
        invoice_date || new Date().toISOString(), due_date || null,
        payment_terms || 0, subtotal, taxAmount, subtotal + taxAmount, notes || null,
      ]
    );

    const invoice = invoiceRows[0];

    const invoiceItems = items.map((item: Record<string, unknown>, index: number) => {
      const taxRate = Number(item.tax_rate) || 0;
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      const discountAmount = Number(item.discount_amount) || 0;
      return {
        invoice_id: invoice.id,
        company_id: companyId,
        product_id: item.product_id,
        quantity,
        unit_price: unitPrice,
        discount_percent: item.discount_percent || 0,
        discount_amount: discountAmount,
        tax_rate: taxRate,
        tax_amount: taxRate > 0 ? (quantity * unitPrice - discountAmount) * (taxRate / 100) : 0,
        notes: item.notes || null,
        sort_order: index,
      };
    });

    for (const ii of invoiceItems) {
      await query(
        `INSERT INTO invoice_items (invoice_id, company_id, product_id, quantity, unit_price, discount_percent, discount_amount, tax_rate, tax_amount, notes, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [ii.invoice_id, ii.company_id, ii.product_id, ii.quantity, ii.unit_price,
         ii.discount_percent, ii.discount_amount, ii.tax_rate, ii.tax_amount, ii.notes, ii.sort_order]
      );
    }

    // Update stock levels
    for (const item of items) {
      const { rows: stockRows } = await query(
        `SELECT id, quantity FROM stock_levels WHERE company_id = $1 AND product_id = $2 AND warehouse_id = $3`,
        [companyId, item.product_id, warehouse_id]
      );

      if (stockRows[0]) {
        await query(
          `UPDATE stock_levels SET quantity = $1, last_movement_at = NOW() WHERE id = $2`,
          [stockRows[0].quantity - item.quantity, stockRows[0].id]
        );
      }

      await query(
        `INSERT INTO stock_movements (company_id, product_id, warehouse_id, type, quantity, reference_type, reference_id, notes)
         VALUES ($1, $2, $3, 'out', $4, 'invoice', $5, $6)`,
        [companyId, item.product_id, warehouse_id, -item.quantity, invoice.id, `Factura ${invoiceNumber}`]
      );
    }

    return successResponse({ ...invoice, items: invoiceItems }, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}