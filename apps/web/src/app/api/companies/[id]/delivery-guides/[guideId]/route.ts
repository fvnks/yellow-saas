import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; guideId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT dg.*,
        (SELECT json_build_object('id', w.id, 'name', w.name, 'code', w.code) FROM warehouses w WHERE w.id = dg.warehouse_id) as warehouse,
        (SELECT json_build_object('id', so.id, 'order_number', so.order_number) FROM sales_orders so WHERE so.id = dg.order_id) as sales_order,
        (SELECT json_agg(json_build_object(
          'id', dgi.id, 'product_id', dgi.product_id, 'quantity', dgi.quantity, 'observation', dgi.observation,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = dgi.product_id)
        )) FROM delivery_guide_items dgi WHERE dgi.guide_id = dg.id) as items
       FROM delivery_guides dg
       WHERE dg.id = $1 AND dg.company_id = $2`,
      [params.guideId, companyId]
    );

    if (!rows[0]) return errorResponse('Delivery guide not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch delivery guide', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; guideId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const { rows } = await query(
      `UPDATE delivery_guides SET
        status = $1, warehouse_id = $2, order_id = $3,
        shipping_date = $4, transport = $5, vehicle_plate = $6,
        updated_at = NOW()
       WHERE id = $7 AND company_id = $8
       RETURNING *`,
      [
        body.status, body.warehouse_id, body.order_id,
        body.shipping_date, body.transport, body.vehicle_plate,
        params.guideId, companyId,
      ]
    );

    if (!rows[0]) return errorResponse('Delivery guide not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update delivery guide', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; guideId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: guide } = await query(
      `SELECT status FROM delivery_guides WHERE id = $1 AND company_id = $2`,
      [params.guideId, companyId]
    );

    if (!guide[0]) return errorResponse('Delivery guide not found', 404);

    const { rows: movements } = await query(
      `SELECT * FROM stock_movements WHERE reference_type = 'delivery_guide' AND reference_id = $1`,
      [params.guideId]
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

    await query(`DELETE FROM delivery_guide_items WHERE guide_id = $1 AND company_id = $2`, [params.guideId, companyId]);
    await query(`DELETE FROM delivery_guides WHERE id = $1 AND company_id = $2`, [params.guideId, companyId]);

    return successResponse({ message: 'Delivery guide deleted successfully' });
  } catch {
    return errorResponse('Failed to delete delivery guide', 500);
  }
}
