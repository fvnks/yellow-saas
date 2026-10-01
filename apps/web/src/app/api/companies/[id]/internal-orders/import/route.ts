import { query, transaction } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  const body = await request.json();
  const { warehouse_id, rows } = body;

  if (!warehouse_id || !rows || !Array.isArray(rows) || rows.length === 0) {
    return errorResponse('warehouse_id y rows son requeridos', 400);
  }

  try {
    const whCheck = await query(
      `SELECT id FROM warehouses WHERE company_id = $1 AND id = $2`,
      [companyId, warehouse_id],
    );
    if (whCheck.rows.length === 0) return errorResponse('Bodega no encontrada', 404);

    // Note: we don't abort the whole batch on per-row errors; we collect per-row errors
    // and return them. That is why we wrap the order creation + item inserts in a
    // savepoint-like flow (we still want atomic order_number allocation).
    const { order, imported, errors } = await transaction(async (client) => {
      const lockHash = await client.query<{ h: bigint }>(
        `SELECT ('x' || substr(md5($1 || ':internal_orders:order_number'), 1, 16))::bit(64)::bigint AS h`,
        [companyId],
      );
      await client.query(`SELECT pg_advisory_xact_lock($1)`, [lockHash.rows[0].h.toString()]);

      const { rows: nRows } = await client.query(
        `SELECT COUNT(*)::int AS c FROM internal_orders WHERE company_id = $1`,
        [companyId],
      );
      const orderNumber = `PED-${String((nRows[0]?.c ?? 0) + 1).padStart(5, '0')}`;

      const { rows: orderResult } = await client.query(
        `INSERT INTO internal_orders (company_id, order_number, warehouse_id, status, priority, notes)
         VALUES ($1, $2, $3, 'pending', 'normal', 'Importado desde archivo') RETURNING *`,
        [companyId, orderNumber, warehouse_id],
      );
      const order = orderResult[0];
      let imported = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          let productId = row.product_id;

          if (!productId && row.sku) {
            const productResult = await client.query(
              `SELECT id FROM products WHERE company_id = $1 AND sku = $2`,
              [companyId, row.sku],
            );
            if (productResult.rows.length > 0) productId = productResult.rows[0].id;
          }

          if (!productId && row.product_name) {
            const productResult = await client.query(
              `SELECT id FROM products WHERE company_id = $1 AND name ILIKE $2 LIMIT 1`,
              [companyId, row.product_name],
            );
            if (productResult.rows.length > 0) productId = productResult.rows[0].id;
          }

          if (!productId) {
            errors.push(`Fila ${i + 1}: No se encontró el producto`);
            continue;
          }

          const quantity = parseFloat(row.quantity) || 0;
          if (quantity <= 0) {
            errors.push(`Fila ${i + 1}: Cantidad inválida`);
            continue;
          }

          await client.query(
            `INSERT INTO internal_order_items (company_id, order_id, product_id, quantity, notes)
             VALUES ($1, $2, $3, $4, $5)`,
            [companyId, order.id, productId, quantity, row.notes || null],
          );
          imported++;
        } catch (e: any) {
          errors.push(`Fila ${i + 1}: ${e.message}`);
        }
      }

      return { order, imported, errors };
    });

    return successResponse({ order, imported, errors, total: rows.length });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
