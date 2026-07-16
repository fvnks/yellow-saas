import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
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
          'id', soi.id, 'product_id', soi.product_id, 'quantity', soi.quantity,
          'unit_price', soi.unit_price, 'discount_percent', soi.discount_percent,
          'tax_rate', soi.tax_rate, 'line_total', soi.line_total,
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
        delivery_date = $5, payment_terms = $6, notes = $7,
        updated_at = NOW()
       WHERE id = $8 AND company_id = $9
       RETURNING *`,
      [
        body.status || 'draft', body.customer_id, body.warehouse_id, body.order_date || null,
        body.delivery_date || null, body.payment_terms || 30, body.notes || null,
        params.orderId, companyId,
      ]
    );

    if (!rows[0]) return errorResponse('Sales order not found', 404);

    if (body.items?.length) {
      await query(`DELETE FROM sales_order_items WHERE order_id = $1 AND company_id = $2`, [
        params.orderId, companyId,
      ]);

      let subtotal = 0;
      for (const item of body.items) {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const discountPercent = Number(item.discount_percent) || 0;
        const lineSubtotal = quantity * unitPrice * (1 - discountPercent / 100);
        subtotal += lineSubtotal;

        await query(
          `INSERT INTO sales_order_items (order_id, company_id, product_id, quantity, unit_price, discount_percent, tax_rate)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            params.orderId, companyId, item.product_id,
            quantity, unitPrice, discountPercent, item.tax_rate || 19,
          ]
        );
      }

      const taxAmount = Math.round(subtotal * 0.19);
      await query(
        `UPDATE sales_orders SET subtotal = $1, tax_amount = $2, total = $3 WHERE id = $4 AND company_id = $5`,
        [subtotal, taxAmount, subtotal + taxAmount, params.orderId, companyId]
      );
    }

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
