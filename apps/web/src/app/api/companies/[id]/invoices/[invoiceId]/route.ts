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
        (SELECT json_build_object('id', so.id, 'number', so.number) FROM sales_orders so WHERE so.id = i.sales_order_id) as sales_order,
        (SELECT json_agg(json_build_object(
          'id', ii.id, 'product_id', ii.product_id, 'quantity', ii.quantity, 'unit_price', ii.unit_price,
          'discount_percent', ii.discount_percent, 'discount_amount', ii.discount_amount,
          'tax_rate', ii.tax_rate, 'tax_amount', ii.tax_amount, 'line_total', ii.line_total, 'notes', ii.notes,
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
        status = $1, payment_status = $2, customer_id = $3, warehouse_id = $4,
        sales_order_id = $5, invoice_date = $6, due_date = $7, payment_terms = $8,
        notes = $9, updated_at = NOW()
       WHERE id = $10 AND company_id = $11
       RETURNING *`,
      [
        body.status, body.payment_status, body.customer_id, body.warehouse_id,
        body.sales_order_id, body.invoice_date, body.due_date, body.payment_terms,
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

    if (invoice[0].status === 'issued' || invoice[0].status === 'paid') {
      const { rows: movements } = await query(
        `SELECT * FROM stock_movements WHERE reference_type = 'invoice' AND reference_id = $1`,
        [params.invoiceId]
      );

      for (const m of movements) {
        const { rows: stock } = await query(
          `SELECT quantity FROM stock_levels WHERE company_id = $1 AND product_id = $2 AND warehouse_id = $3`,
          [companyId, m.product_id, m.warehouse_id]
        );

        if (stock[0]) {
          await query(
            `UPDATE stock_levels SET quantity = $1 WHERE company_id = $2 AND product_id = $3 AND warehouse_id = $4`,
            [stock[0].quantity + Math.abs(m.quantity), companyId, m.product_id, m.warehouse_id]
          );
        }

        await query(`DELETE FROM stock_movements WHERE id = $1`, [m.id]);
      }
    }

    await query(`DELETE FROM invoice_items WHERE invoice_id = $1 AND company_id = $2`, [params.invoiceId, companyId]);
    await query(`DELETE FROM invoices WHERE id = $1 AND company_id = $2`, [params.invoiceId, companyId]);

    return successResponse({ message: 'Invoice deleted successfully' });
  } catch {
    return errorResponse('Failed to delete invoice', 500);
  }
}
