import { query, transaction } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string; transferId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { status } = body;

    if (!status || !['pending', 'in_transit', 'delivered', 'cancelled'].includes(status)) {
      return errorResponse('Invalid status', 400);
    }

    const result = await transaction(async (client) => {
      const { rows } = await client.query(
        `UPDATE stock_transfers SET status = $3, updated_at = NOW()
         WHERE id = $1 AND company_id = $2
         RETURNING *`,
        [params.transferId, companyId, status]
      );

      if (rows.length === 0) return null;

      if (status === 'delivered') {
        const transfer = rows[0];

        const itemsResult = await client.query(
          `SELECT * FROM stock_transfer_items WHERE transfer_id = $1 AND company_id = $2`,
          [params.transferId, companyId]
        );

        for (const item of itemsResult.rows) {
          await client.query(
            `UPDATE stock_levels SET quantity = quantity - $1, updated_at = NOW()
             WHERE product_id = $2 AND warehouse_id = $3 AND company_id = $4`,
            [item.quantity, item.product_id, transfer.source_warehouse_id, companyId]
          );

          await client.query(
            `INSERT INTO stock_levels (company_id, product_id, warehouse_id, quantity)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (company_id, product_id, warehouse_id)
             DO UPDATE SET quantity = stock_levels.quantity + $4, updated_at = NOW()`,
            [companyId, item.product_id, transfer.destination_warehouse_id, item.quantity]
          );

          await client.query(
            `INSERT INTO stock_movements (company_id, product_id, warehouse_id, type, quantity, reference_type, reference_id, notes)
             VALUES ($1, $2, $3, 'transfer_out', $4, 'stock_transfer', $5, 'Transferencia saliente'),
                    ($1, $2, $6, 'transfer_in', $4, 'stock_transfer', $5, 'Transferencia entrante')`,
            [companyId, item.product_id, transfer.source_warehouse_id, item.quantity, transfer.id, transfer.destination_warehouse_id]
          );
        }
      }

      return rows[0];
    });

    if (!result) return errorResponse('Transfer not found', 404);
    return successResponse(result);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
