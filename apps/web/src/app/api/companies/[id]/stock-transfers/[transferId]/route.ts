import { query } from '@/api/lib/db';
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

    const updates: string[] = ['status = $3'];
    const values: any[] = [params.transferId, companyId, status];
    let idx = 4;

    const { rows } = await query(
      `UPDATE stock_transfers SET ${updates.join(', ')}
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      values
    );

    if (rows.length === 0) return errorResponse('Transfer not found', 404);

    if (status === 'delivered') {
      const transfer = rows[0];

      const itemsResult = await query(
        `SELECT * FROM stock_transfer_items WHERE transfer_id = $1 AND company_id = $2`,
        [params.transferId, companyId]
      );

      for (const item of itemsResult.rows) {
        await query(
          `UPDATE stock_levels SET quantity = quantity - $1
           WHERE product_id = $2 AND warehouse_id = $3 AND company_id = $4`,
          [item.quantity, item.product_id, transfer.source_warehouse_id, companyId]
        );

        await query(
          `INSERT INTO stock_levels (company_id, product_id, warehouse_id, quantity)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (company_id, product_id, warehouse_id)
           DO UPDATE SET quantity = stock_levels.quantity + $4`,
          [companyId, item.product_id, transfer.destination_warehouse_id, item.quantity]
        );

        await query(
          `INSERT INTO stock_movements (company_id, product_id, warehouse_id, type, quantity, reference_type, reference_id, notes)
           VALUES ($1, $2, $3, 'transfer_out', $4, 'stock_transfer', $5, 'Transferencia saliente'),
            ($1, $2, $6, 'transfer_in', $4, 'stock_transfer', $5, 'Transferencia entrante')`,
          [companyId, item.product_id, transfer.source_warehouse_id, item.quantity, transfer.id, transfer.destination_warehouse_id]
        );
      }
    }

    return successResponse(rows[0]);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
