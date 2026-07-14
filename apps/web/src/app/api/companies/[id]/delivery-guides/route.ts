import { query } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const params: any[] = [companyId];
    let where = 'WHERE dg.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND dg.guide_number ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      where += ` AND dg.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as count FROM delivery_guides dg ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT dg.*,
        (SELECT json_build_object('id', w.id, 'name', w.name, 'code', w.code) FROM warehouses w WHERE w.id = dg.warehouse_id) as warehouse,
        (SELECT json_build_object('id', so.id, 'order_number', so.order_number) FROM sales_orders so WHERE so.id = dg.order_id) as sales_order,
        (SELECT json_agg(json_build_object(
          'id', dgi.id, 'product_id', dgi.product_id, 'quantity', dgi.quantity, 'observation', dgi.observation,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = dgi.product_id)
        )) FROM delivery_guide_items dgi WHERE dgi.guide_id = dg.id) as items
       FROM delivery_guides dg
       ${where}
       ORDER BY dg.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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
      warehouse_id, order_id, shipping_date,
      transport, vehicle_plate, items,
    } = body;

    if (!warehouse_id || !items?.length) {
      return errorResponse('Warehouse and items are required', 400);
    }

    const { rows: countRows } = await query(
      `SELECT COUNT(*) as count FROM delivery_guides WHERE company_id = $1`,
      [companyId]
    );
    const guideNumber = `GD-${String((parseInt(countRows[0]?.count || '0') + 1)).padStart(6, '0')}`;

    // Check stock for each item
    for (const item of items) {
      const { rows: stockRows } = await query(
        `SELECT quantity FROM stock_levels WHERE company_id = $1 AND product_id = $2 AND warehouse_id = $3`,
        [companyId, item.product_id, warehouse_id]
      );

      if (!stockRows[0] || stockRows[0].quantity < item.quantity) {
        return errorResponse(
          `Stock insuficiente para ${item.product_name || item.product_id}. Disponible: ${stockRows[0]?.quantity || 0}`,
          400
        );
      }
    }

    const { rows: guideRows } = await query(
      `INSERT INTO delivery_guides (company_id, warehouse_id, order_id, guide_number, status, shipping_date, transport, vehicle_plate)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7)
       RETURNING *`,
      [
        companyId, warehouse_id, order_id || null, guideNumber,
        shipping_date || new Date().toISOString(), transport || null, vehicle_plate || null,
      ]
    );

    const guide = guideRows[0];

    const guideItems = items.map((item: Record<string, unknown>) => ({
      guide_id: guide.id,
      company_id: companyId,
      product_id: item.product_id,
      quantity: item.quantity,
      observation: item.observation || null,
    }));

    for (const gi of guideItems) {
      await query(
        `INSERT INTO delivery_guide_items (guide_id, company_id, product_id, quantity, observation)
         VALUES ($1, $2, $3, $4, $5)`,
        [gi.guide_id, gi.company_id, gi.product_id, gi.quantity, gi.observation]
      );
    }

    // Update stock levels
    for (const item of items) {
      const { rows: stockRows } = await query(
        `SELECT id, quantity FROM stock_levels WHERE company_id = $1 AND product_id = $2 AND warehouse_id = $3`,
        [companyId, item.product_id, warehouse_id]
      );

      if (stockRows[0]) {
        await query(
          `UPDATE stock_levels SET quantity = $1, last_movement_at = NOW() WHERE id = $2`,
          [stockRows[0].quantity - item.quantity, stockRows[0].id]
        );
      }

      await query(
        `INSERT INTO stock_movements (company_id, product_id, warehouse_id, type, quantity, reference_type, reference_id, notes)
         VALUES ($1, $2, $3, 'out', $4, 'delivery_guide', $5, $6)`,
        [companyId, item.product_id, warehouse_id, -item.quantity, guide.id, `Despacho según ${guideNumber}`]
      );
    }

    return successResponse({ ...guide, items: guideItems }, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}