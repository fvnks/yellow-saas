import { query } from '@/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT so.*,
        (SELECT json_build_object('id', c.id, 'name', c.name, 'tax_id', c.tax_id) FROM customers c WHERE c.id = so.customer_id) as customer,
        (SELECT json_build_object('id', w.id, 'name', w.name, 'code', w.code) FROM warehouses w WHERE w.id = so.warehouse_id) as warehouse,
        (SELECT json_agg(json_build_object(
          'id', soi.id, 'product_id', soi.product_id, 'variant_id', soi.variant_id, 'quantity', soi.quantity,
          'unit_price', soi.unit_price, 'discount_percent', soi.discount_percent, 'discount_amount', soi.discount_amount,
          'tax_rate', soi.tax_rate, 'tax_amount', soi.tax_amount, 'line_total', soi.line_total, 'notes', soi.notes,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = soi.product_id)
        )) FROM sales_order_items soi WHERE soi.order_id = so.id) as items
       FROM sales_orders so
       WHERE so.id = $1 AND so.company_id = $2`,
      [params.orderId, companyId]
    );

    if (!rows[0]) return errorResponse('Sales order not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch sales order', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const { rows } = await query(
      `UPDATE sales_orders SET
        status = $1, customer_id = $2, warehouse_id = $3, order_date = $4,
        delivery_date = $5, payment_terms = $6, notes = $7, internal_notes = $8,
        updated_at = NOW()
       WHERE id = $9 AND company_id = $10
       RETURNING *`,
      [
        body.status, body.customer_id, body.warehouse_id, body.order_date,
        body.delivery_date, body.payment_terms, body.notes, body.internal_notes,
        params.orderId, companyId,
      ]
    );

    if (!rows[0]) return errorResponse('Sales order not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update sales order', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: order } = await query(
      `SELECT status FROM sales_orders WHERE id = $1 AND company_id = $2`,
      [params.orderId, companyId]
    );

    if (!order[0]) return errorResponse('Sales order not found', 404);

    if (order[0].status !== 'draft') {
      return errorResponse('Only draft orders can be deleted', 400);
    }

    await query(`DELETE FROM sales_order_items WHERE order_id = $1 AND company_id = $2`, [params.orderId, companyId]);
    await query(`DELETE FROM sales_orders WHERE id = $1 AND company_id = $2`, [params.orderId, companyId]);

    return successResponse({ message: 'Sales order deleted successfully' });
  } catch {
    return errorResponse('Failed to delete sales order', 500);
  }
}
