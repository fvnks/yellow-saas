import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; invoiceId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT i.*,
        (SELECT json_build_object('id', c.id, 'name', c.name, 'tax_id', c.tax_id) FROM customers c WHERE c.id = i.customer_id) as customer,
        (SELECT json_build_object('id', w.id, 'name', w.name, 'code', w.code) FROM warehouses w WHERE w.id = i.warehouse_id) as warehouse,
        (SELECT json_build_object('id', so.id, 'order_number', so.order_number) FROM sales_orders so WHERE so.id = i.order_id) as sales_order,
        (SELECT json_agg(json_build_object(
          'id', ii.id, 'product_id', ii.product_id, 'description', ii.description, 'quantity', ii.quantity, 'unit_price', ii.unit_price,
          'discount_percent', ii.discount_percent,
          'tax_rate', ii.tax_rate, 'tax_amount', ii.tax_amount, 'line_total', ii.line_total,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = ii.product_id)
        )) FROM invoice_items ii WHERE ii.invoice_id = i.id) as items
       FROM invoices i
       WHERE i.id = $1 AND i.company_id = $2`,
      [params.invoiceId, companyId]
    );

    if (!rows[0]) return errorResponse('Invoice not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch invoice', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; invoiceId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const { rows } = await query(
      `UPDATE invoices SET
        status = $1, payment_status = $2, customer_id = $3,
        order_id = $4, invoice_date = $5, due_date = $6, payment_terms = $7,
        notes = $8, updated_at = NOW()
       WHERE id = $9 AND company_id = $10
       RETURNING *`,
      [
        body.status, body.payment_status, body.customer_id,
        body.order_id, body.invoice_date, body.due_date, body.payment_terms,
        body.notes, params.invoiceId, companyId,
      ]
    );

    if (!rows[0]) return errorResponse('Invoice not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update invoice', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; invoiceId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: invoice } = await query(
      `SELECT status FROM invoices WHERE id = $1 AND company_id = $2`,
      [params.invoiceId, companyId]
    );

    if (!invoice[0]) return errorResponse('Invoice not found', 404);

    await query(`DELETE FROM invoice_items WHERE invoice_id = $1 AND company_id = $2`, [params.invoiceId, companyId]);
    await query(`DELETE FROM invoices WHERE id = $1 AND company_id = $2`, [params.invoiceId, companyId]);

    return successResponse({ message: 'Invoice deleted successfully' });
  } catch {
    return errorResponse('Failed to delete invoice', 500);
  }
}
