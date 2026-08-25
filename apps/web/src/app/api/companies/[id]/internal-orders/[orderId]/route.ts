import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string; orderId: string } }) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  try {
    const result = await query(
      `SELECT io.*, p.full_name as requested_by_name, w.name as warehouse_name
       FROM internal_orders io
       LEFT JOIN profiles p ON p.id = io.requested_by
       LEFT JOIN warehouses w ON w.id = io.warehouse_id
       WHERE io.id = $1 AND io.company_id = $2`,
      [params.orderId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Pedido no encontrado', 404);

    const items = await query(
      `SELECT ioi.*, pr.name as product_name, pr.sku
       FROM internal_order_items ioi
       JOIN products pr ON pr.id = ioi.product_id
       WHERE ioi.order_id = $1`,
      [params.orderId]
    );

    return successResponse({ ...result.rows[0], items: items.rows });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; orderId: string } }) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  const body = await request.json();
  const { status, priority, notes, fulfilled_items } = body;

  try {
    if (status) {
      const updates: string[] = ['status = $1'];
      const values: any[] = [status];
      let idx = 2;

      if (status === 'approved') {
        updates.push(`approved_by = $${idx}`, `approved_at = now()`);
        values.push(body.approved_by || null);
        idx++;
      }
      if (status === 'completed') {
        updates.push(`completed_at = now()`);
      }
      if (priority) {
        updates.push(`priority = $${idx}`);
        values.push(priority);
        idx++;
      }
      if (notes !== undefined) {
        updates.push(`notes = $${idx}`);
        values.push(notes);
        idx++;
      }

      values.push(params.orderId, companyId);
      await query(
        `UPDATE internal_orders SET ${updates.join(', ')}, updated_at = now() WHERE id = $${idx} AND company_id = $${idx + 1}`,
        values
      );
    }

    if (fulfilled_items && Array.isArray(fulfilled_items)) {
      for (const item of fulfilled_items) {
        await query(
          `UPDATE internal_order_items SET fulfilled_quantity = $1 WHERE id = $2 AND company_id = $3`,
          [item.fulfilled_quantity, item.id, companyId]
        );
      }
    }

    return successResponse({ updated: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; orderId: string } }) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  try {
    await query('DELETE FROM internal_order_items WHERE order_id = $1 AND company_id = $2', [params.orderId, companyId]);
    await query('DELETE FROM internal_orders WHERE id = $1 AND company_id = $2', [params.orderId, companyId]);
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
