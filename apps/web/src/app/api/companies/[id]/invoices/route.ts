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
    const allowedSortColumns = ['created_at', 'invoice_number', 'status', 'total_amount', 'invoice_date', 'id'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const customer = url.searchParams.get('customer');

    const params: any[] = [companyId];
    let where = 'WHERE i.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND (i.invoice_number ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
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
        (SELECT json_build_object('id', so.id, 'number', so.order_number) FROM sales_orders so WHERE so.id = i.order_id) as sales_order,
        (SELECT json_build_object('id', pj.id, 'name', pj.name, 'code', pj.code) FROM projects pj WHERE pj.id = i.project_id) as project,
        (SELECT json_agg(json_build_object(
          'id', ii.id, 'product_id', ii.product_id, 'description', ii.description, 'quantity', ii.quantity, 'unit_price', ii.unit_price,
          'discount_percent', ii.discount_percent,
          'tax_rate', ii.tax_rate, 'tax_amount', ii.tax_amount, 'line_total', ii.line_total,
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
      customer_id, order_id, invoice_date,
      due_date, payment_terms, notes, items, document_type, status: requestedStatus, payment_method, card_transaction_number,
    } = body;

    if (!items?.length) {
      return errorResponse('Items are required', 400);
    }

    // Ensure customer_id allows NULL (for boletas without customer)
    try { await query('ALTER TABLE invoices ALTER COLUMN customer_id DROP NOT NULL', []); } catch { /* already nullable */ }
    // Ensure document_type column exists
    try { await query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'invoices'::regclass AND attname = 'document_type') THEN ALTER TABLE invoices ADD COLUMN document_type TEXT DEFAULT 'factura' CHECK (document_type IN ('boleta', 'factura')); END IF; END $$`, []); } catch { /* already exists */ }

    const docType = document_type === 'boleta' ? 'boleta' : 'factura';
    if (docType === 'factura' && !customer_id) {
      return errorResponse('Customer is required for facturas', 400);
    }

    const { rows: countRows } = await query(
      `SELECT COUNT(*) as count FROM invoices WHERE company_id = $1 AND document_type = $2`,
      [companyId, docType]
    );
    const prefix = docType === 'boleta' ? 'BF' : 'FE';
    const invoiceNumber = `${prefix}-${String((parseInt(countRows[0]?.count || '0') + 1)).padStart(6, '0')}`;

    let subtotal = 0;
    let taxAmount = 0;
    for (const item of items) {
      const discountPct = Number(item.discount_percent || item.discount || 0);
      const lineSubtotal = item.quantity * item.unit_price;
      const discountAmount = lineSubtotal * (discountPct / 100);
      const lineTax = (lineSubtotal - discountAmount) * ((item.tax_rate || 0) / 100);
      subtotal += lineSubtotal - discountAmount;
      taxAmount += lineTax;
    }

    // Ensure payment_method column exists
    try { await query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'invoices'::regclass AND attname = 'payment_method') THEN ALTER TABLE invoices ADD COLUMN payment_method TEXT; END IF; END $$`, []); } catch { /* already exists */ }

    const { rows: invoiceRows } = await query(
      `INSERT INTO invoices (company_id, customer_id, order_id, invoice_number, document_type, status, invoice_date, due_date, payment_terms, subtotal, tax_amount, total_amount, notes, payment_method, card_transaction_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        companyId, customer_id || null, order_id || null, invoiceNumber, docType,
        requestedStatus || 'pending',
        invoice_date || new Date().toISOString(), due_date || null,
        payment_terms || 0, subtotal, taxAmount, subtotal + taxAmount, notes || null,
        payment_method || null, card_transaction_number || null,
      ]
    );

    const invoice = invoiceRows[0];

    const invoiceItems = items.map((item: Record<string, unknown>) => {
      const taxRate = Number(item.tax_rate) || 0;
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      const discountPct = Number(item.discount_percent || item.discount || 0);
      return {
        invoice_id: invoice.id,
        company_id: companyId,
        product_id: item.product_id,
        description: item.description || '',
        quantity,
        unit_price: unitPrice,
        discount_percent: discountPct,
        tax_rate: taxRate,
      };
    });

    for (const ii of invoiceItems) {
      await query(
        `INSERT INTO invoice_items (invoice_id, company_id, product_id, description, quantity, unit_price, discount_percent, tax_rate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [ii.invoice_id, ii.company_id, ii.product_id, ii.description, ii.quantity, ii.unit_price,
         ii.discount_percent, ii.tax_rate]
      );
    }

    return successResponse({ ...invoice, items: invoiceItems }, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { id, card_transaction_number, status, payment_method } = body;

    if (!id) return errorResponse('Invoice ID requerido', 400);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (card_transaction_number !== undefined) { fields.push(`card_transaction_number = $${idx}`); values.push(card_transaction_number); idx++; }
    if (status !== undefined) { fields.push(`status = $${idx}`); values.push(status); idx++; }
    if (payment_method !== undefined) { fields.push(`payment_method = $${idx}`); values.push(payment_method); idx++; }

    if (fields.length === 0) return errorResponse('No fields to update', 400);

    fields.push(`updated_at = NOW()`);
    values.push(companyId, id);

    const { rows } = await query(
      `UPDATE invoices SET ${fields.join(', ')} WHERE company_id = $${idx} AND id = $${idx + 1} RETURNING *`,
      values
    );

    if (rows.length === 0) return errorResponse('Factura no encontrada', 404);
    return successResponse(rows[0]);
  } catch (e: any) {
    console.error('PATCH invoices error:', e);
    return errorResponse(e.message, 500);
  }
}