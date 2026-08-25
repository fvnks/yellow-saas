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
      `SELECT po.*,
        (SELECT json_build_object('id', s.id, 'name', s.name, 'tax_id', s.tax_id) FROM suppliers s WHERE s.id = po.supplier_id) as supplier,
        (SELECT json_build_object('id', w.id, 'name', w.name, 'code', w.code) FROM warehouses w WHERE w.id = po.warehouse_id) as warehouse,
        (SELECT json_agg(json_build_object(
          'id', poi.id, 'product_id', poi.product_id, 'quantity', poi.quantity,
          'received_quantity', poi.received_quantity, 'unit_price', poi.unit_price,
          'discount_percent', poi.discount_percent, 'discount_amount', poi.discount_amount,
          'tax_rate', poi.tax_rate, 'tax_amount', poi.tax_amount, 'line_total', poi.line_total, 'notes', poi.notes,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = poi.product_id)
        )) FROM purchase_order_items poi WHERE poi.order_id = po.id) as items
       FROM purchase_orders po
       WHERE po.id = $1 AND po.company_id = $2`,
      [params.orderId, companyId]
    );

    if (!rows[0]) return errorResponse('Purchase order not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch purchase order', 500);
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

    const {
      status, supplier_id, warehouse_id, order_date,
      expected_date, payment_terms, notes, internal_notes, items, project_id,
    } = body;

    const { rows } = await query(
      `UPDATE purchase_orders SET
        status = $1, supplier_id = $2, warehouse_id = $3, order_date = $4,
        expected_date = $5, payment_terms = $6, notes = $7, internal_notes = $8,
        project_id = $9, updated_at = NOW()
       WHERE id = $10 AND company_id = $11
       RETURNING *`,
      [
        status, supplier_id, warehouse_id, order_date,
        expected_date, payment_terms, notes, internal_notes,
        project_id || null, params.orderId, companyId,
      ]
    );

    if (!rows[0]) return errorResponse('Purchase order not found', 404);

    if (items && Array.isArray(items)) {
      await query(`DELETE FROM purchase_order_items WHERE order_id = $1`, [params.orderId]);

      for (const item of items) {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const discountPercent = Number(item.discount_percent) || 0;
        const taxRate = Number(item.tax_rate) || 19;
        const discountAmount = quantity * unitPrice * (discountPercent / 100);
        const taxAmount = (quantity * unitPrice - discountAmount) * (taxRate / 100);
        const lineTotal = quantity * unitPrice - discountAmount + taxAmount;

        await query(
          `INSERT INTO purchase_order_items (order_id, company_id, product_id, quantity, unit_price, discount_percent, discount_amount, tax_rate, tax_amount, line_total)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [params.orderId, companyId, item.product_id, quantity, unitPrice,
           discountPercent, discountAmount, taxRate, taxAmount, lineTotal]
        );
      }
    }

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update purchase order', 500);
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
      `SELECT status FROM purchase_orders WHERE id = $1 AND company_id = $2`,
      [params.orderId, companyId]
    );

    if (!order[0]) return errorResponse('Purchase order not found', 404);

    if (order[0].status !== 'draft') {
      return errorResponse('Only draft orders can be deleted', 400);
    }

    await query(`DELETE FROM purchase_order_items WHERE order_id = $1 AND company_id = $2`, [params.orderId, companyId]);
    await query(`DELETE FROM purchase_orders WHERE id = $1 AND company_id = $2`, [params.orderId, companyId]);

    return successResponse({ message: 'Purchase order deleted successfully' });
  } catch {
    return errorResponse('Failed to delete purchase order', 500);
  }
}
