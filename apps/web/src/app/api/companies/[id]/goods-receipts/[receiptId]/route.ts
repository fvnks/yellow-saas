import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

const allowedStatus = ['pending', 'received', 'completed', 'cancelled'];

export async function GET(request: NextRequest, { params }: { params: { id: string; receiptId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
       `SELECT gr.*, s.name as supplier_name, w.name as warehouse_name, po.number as order_number
       FROM goods_receipts gr
       LEFT JOIN suppliers s ON s.id = gr.supplier_id
       LEFT JOIN warehouses w ON w.id = gr.warehouse_id
       LEFT JOIN purchase_orders po ON po.id = gr.purchase_order_id
       WHERE gr.company_id = $1 AND gr.id = $2`,
      [companyId, params.receiptId]
    );

    if (result.rows.length === 0) return errorResponse('Record not found', 404);

    const items = await query(
      `SELECT gri.*, p.name as product_name, p.sku, poi.quantity as ordered_quantity
       FROM goods_receipt_items gri
       LEFT JOIN products p ON p.id = gri.product_id
       LEFT JOIN purchase_order_items poi ON poi.id = gri.purchase_order_item_id
       WHERE gri.goods_receipt_id = $1`,
      [params.receiptId]
    );

    const data = { ...result.rows[0], items: items.rows };
    return successResponse(data);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; receiptId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { purchase_order_id, supplier_id, warehouse_id, status, received_date, notes, created_by, items } = body;

    if (status && !allowedStatus.includes(status)) return errorResponse('Invalid status', 400);

    if (purchase_order_id) {
      const orderExists = await query(
        `SELECT id FROM purchase_orders WHERE company_id = $1 AND id = $2`,
        [companyId, purchase_order_id]
      );
      if (orderExists.rows.length === 0) return errorResponse('Purchase order not found', 404);
    }

    if (supplier_id) {
      const supplierExists = await query(
        `SELECT id FROM suppliers WHERE company_id = $1 AND id = $2`,
        [companyId, supplier_id]
      );
      if (supplierExists.rows.length === 0) return errorResponse('Supplier not found', 404);
    }

    if (warehouse_id) {
      const warehouseExists = await query(
        `SELECT id FROM warehouses WHERE company_id = $1 AND id = $2`,
        [companyId, warehouse_id]
      );
      if (warehouseExists.rows.length === 0) return errorResponse('Warehouse not found', 404);
    }

    const result = await query(
      `UPDATE goods_receipts SET
        purchase_order_id = COALESCE($1, purchase_order_id),
        supplier_id = COALESCE($2, supplier_id),
        warehouse_id = COALESCE($3, warehouse_id),
        status = COALESCE($4, status),
        received_date = COALESCE($5, received_date),
        notes = $6,
        created_by = COALESCE($7, created_by),
        updated_at = now()
       WHERE company_id = $8 AND id = $9
       RETURNING *`,
      [purchase_order_id, supplier_id, warehouse_id, status, received_date, notes, created_by, companyId, params.receiptId]
    );

    if (result.rows.length === 0) return errorResponse('Record not found', 404);

    if (items && Array.isArray(items)) {
      await query(`DELETE FROM goods_receipt_items WHERE goods_receipt_id = $1`, [params.receiptId]);

      for (const item of items) {
        await query(
          `INSERT INTO goods_receipt_items (goods_receipt_id, purchase_order_item_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [params.receiptId, item.purchase_order_item_id || null, item.product_id, item.quantity, item.unit_price || 0]
        );
      }
    }

    if (status === 'completed') {
      const receiptItems = await query(
        `SELECT * FROM goods_receipt_items WHERE goods_receipt_id = $1 AND purchase_order_item_id IS NOT NULL`,
        [params.receiptId]
      );

      for (const item of receiptItems.rows) {
        await query(
          `UPDATE purchase_order_items SET received_quantity = COALESCE(received_quantity, 0) + $1 WHERE id = $2`,
          [item.quantity, item.purchase_order_item_id]
        );
      }
    }

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; receiptId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const existing = await query(
      `SELECT id, status FROM goods_receipts WHERE company_id = $1 AND id = $2`,
      [companyId, params.receiptId]
    );
    if (existing.rows.length === 0) return errorResponse('Record not found', 404);

    if (existing.rows[0].status === 'completed') {
      return errorResponse('Cannot delete a completed receipt', 400);
    }

    await query(`DELETE FROM goods_receipt_items WHERE goods_receipt_id = $1`, [params.receiptId]);

    const result = await query(
      `DELETE FROM goods_receipts WHERE company_id = $1 AND id = $2 RETURNING id`,
      [companyId, params.receiptId]
    );

    if (result.rows.length === 0) return errorResponse('Record not found', 404);
    return successResponse({ message: 'Record deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
