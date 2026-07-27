import { query } from '@/api/lib/db';
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
    const numberResult = await query(
      `SELECT COUNT(*) + 1 as next FROM internal_orders WHERE company_id = $1`,
      [companyId]
    );
    const orderNumber = `PED-${String(numberResult.rows[0].next).padStart(5, '0')}`;

    const orderResult = await query(
      `INSERT INTO internal_orders (company_id, order_number, warehouse_id, status, priority, notes)
       VALUES ($1, $2, $3, 'pending', 'normal', 'Importado desde archivo') RETURNING *`,
      [companyId, orderNumber, warehouse_id]
    );

    const order = orderResult.rows[0];
    let imported = 0;
    let errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        let productId = row.product_id;

        if (!productId && row.sku) {
          const productResult = await query(
            `SELECT id FROM products WHERE company_id = $1 AND sku = $2`,
            [companyId, row.sku]
          );
          if (productResult.rows.length > 0) {
            productId = productResult.rows[0].id;
          }
        }

        if (!productId && row.product_name) {
          const productResult = await query(
            `SELECT id FROM products WHERE company_id = $1 AND name ILIKE $2 LIMIT 1`,
            [companyId, row.product_name]
          );
          if (productResult.rows.length > 0) {
            productId = productResult.rows[0].id;
          }
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

        await query(
          `INSERT INTO internal_order_items (company_id, order_id, product_id, quantity, notes)
           VALUES ($1, $2, $3, $4, $5)`,
          [companyId, order.id, productId, quantity, row.notes || null]
        );
        imported++;
      } catch (e: any) {
        errors.push(`Fila ${i + 1}: ${e.message}`);
      }
    }

    return successResponse({
      order,
      imported,
      errors,
      total: rows.length
    });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
