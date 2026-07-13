import { query } from '../../../lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '../../../lib/helpers';
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
    let where = 'WHERE q.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND q.number ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      where += ` AND q.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (supplier) {
      where += ` AND q.supplier_id = $${paramIndex}`;
      params.push(supplier);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as count FROM quotations q ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT q.*,
        (SELECT json_build_object('id', s.id, 'name', s.name, 'tax_id', s.tax_id) FROM suppliers s WHERE s.id = q.supplier_id) as supplier,
        (SELECT json_agg(json_build_object(
          'id', qi.id, 'product_id', qi.product_id, 'quantity', qi.quantity, 'unit_price', qi.unit_price,
          'discount_percent', qi.discount_percent, 'discount_amount', qi.discount_amount,
          'tax_rate', qi.tax_rate, 'tax_amount', qi.tax_amount, 'line_total', qi.line_total, 'notes', qi.notes,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = qi.product_id)
        )) FROM quotation_items qi WHERE qi.quotation_id = q.id) as items
       FROM quotations q
       ${where}
       ORDER BY q.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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
      supplier_id, quote_date, expiry_date, valid_until,
      payment_terms, delivery_terms, notes, internal_notes, items,
    } = body;

    if (!supplier_id || !items?.length) {
      return errorResponse('Supplier and items are required', 400);
    }

    const { rows: countRows } = await query(
      `SELECT COUNT(*) as count FROM quotations WHERE company_id = $1`,
      [companyId]
    );
    const quotationNumber = `COT-${String((parseInt(countRows[0]?.count || '0') + 1)).padStart(6, '0')}`;

    let subtotal = 0;
    let taxAmount = 0;
    for (const item of items) {
      const lineSubtotal = item.quantity * item.unit_price - (item.discount_amount || 0);
      const lineTax = lineSubtotal * ((item.tax_rate || 0) / 100);
      subtotal += lineSubtotal;
      taxAmount += lineTax;
    }

    const { rows: quotationRows } = await query(
      `INSERT INTO quotations (company_id, supplier_id, number, status, quote_date, expiry_date, valid_until, subtotal, tax_amount, total_amount, payment_terms, delivery_terms, notes, internal_notes)
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        companyId, supplier_id, quotationNumber,
        quote_date || new Date().toISOString(), expiry_date || null, valid_until || null,
        subtotal, taxAmount, subtotal + taxAmount,
        payment_terms || null, delivery_terms || null, notes || null, internal_notes || null,
      ]
    );

    const quotation = quotationRows[0];

    const quotationItems = items.map((item: Record<string, unknown>, index: number) => {
      const taxRate = Number(item.tax_rate) || 0;
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      const discountAmount = Number(item.discount_amount) || 0;
      return {
        quotation_id: quotation.id,
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

    for (const qi of quotationItems) {
      await query(
        `INSERT INTO quotation_items (quotation_id, company_id, product_id, quantity, unit_price, discount_percent, discount_amount, tax_rate, tax_amount, notes, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [qi.quotation_id, qi.company_id, qi.product_id, qi.quantity, qi.unit_price,
         qi.discount_percent, qi.discount_amount, qi.tax_rate, qi.tax_amount, qi.notes, qi.sort_order]
      );
    }

    return successResponse({ ...quotation, items: quotationItems }, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}