import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: invoices } = await query(
      `SELECT pi.*, s.name as supplier_name, s.tax_id as supplier_tax_id,
        po.order_number as po_number,
        (SELECT json_agg(json_build_object(
          'id', pii.id, 'description', pii.description, 'quantity', pii.quantity,
          'unit_price', pii.unit_price, 'discount_pct', pii.discount_pct,
          'tax_pct', pii.tax_pct, 'line_total', pii.line_total,
          'purchase_category_id', pii.purchase_category_id
        )) FROM purchase_invoice_items pii WHERE pii.invoice_id = pi.id) as items
       FROM purchase_invoices pi
       JOIN suppliers s ON s.id = pi.supplier_id
       LEFT JOIN purchase_orders po ON po.id = pi.purchase_order_id
       WHERE pi.company_id = $1
       ORDER BY pi.created_at DESC`,
      [companyId]
    );

    return successResponse(invoices);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { supplier_id, invoice_number, invoice_date, due_date, purchase_order_id, notes, payment_terms, currency, items } = body;

    if (!supplier_id || !invoice_number) {
      return errorResponse('supplier_id, invoice_number son requeridos', 400);
    }

    const subtotal = (items || []).reduce((sum: number, i: any) => sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0) * (1 - (parseFloat(i.discount_pct) || 0) / 100), 0);
    const taxAmount = subtotal * 0.19;
    const totalAmount = subtotal + taxAmount;

    const { rows } = await query(
      `INSERT INTO purchase_invoices (company_id, supplier_id, invoice_number, invoice_date, due_date, subtotal, tax_amount, total_amount, purchase_order_id, notes, payment_terms, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [companyId, supplier_id, invoice_number, invoice_date || new Date().toISOString().split('T')[0], due_date || null, subtotal, taxAmount, totalAmount, purchase_order_id || null, notes || null, payment_terms || null, currency || 'CLP']
    );

    const invoiceId = rows[0].id;
    for (const item of (items || [])) {
      const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0) * (1 - (parseFloat(item.discount_pct) || 0) / 100);
      await query(
        `INSERT INTO purchase_invoice_items (company_id, invoice_id, product_id, description, quantity, unit_price, discount_pct, tax_pct, line_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [companyId, invoiceId, item.product_id || null, item.description || null, item.quantity || 1, item.unit_price || 0, item.discount_pct || 0, item.tax_pct || 19, lineTotal]
      );
    }

    return successResponse(rows[0], 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
