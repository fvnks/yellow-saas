import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string; transferId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { status } = body;

    if (!status || !['pending', 'in_transit', 'completed', 'cancelled'].includes(status)) {
      return errorResponse('Invalid status', 400);
    }

    const updates: string[] = ['status = $3'];
    const values: any[] = [params.transferId, companyId, status];
    let idx = 4;

    if (status === 'completed') {
      updates.push(`completed_at = NOW()`);
    }

    const { rows } = await query(
      `UPDATE stock_transfers SET ${updates.join(', ')}
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      values
    );

    if (rows.length === 0) return errorResponse('Transfer not found', 404);

    if (status === 'completed') {
      const transfer = rows[0];

      await query(
        `UPDATE stock_levels SET quantity = quantity - $1
         WHERE product_id = $2 AND warehouse_id = $3 AND company_id = $4`,
        [transfer.quantity, transfer.product_id, transfer.from_warehouse_id, companyId]
      );

      await query(
        `INSERT INTO stock_levels (company_id, product_id, warehouse_id, quantity)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (company_id, product_id, warehouse_id)
         DO UPDATE SET quantity = stock_levels.quantity + $4`,
        [companyId, transfer.product_id, transfer.to_warehouse_id, transfer.quantity]
      );

      await query(
        `INSERT INTO stock_movements (company_id, product_id, warehouse_id, type, quantity, reference_type, reference_id, notes)
         VALUES ($1, $2, $3, 'out', $4, 'transfer', $5, 'Transferencia saliente'),
         ($1, $2, $6, 'in', $4, 'transfer', $5, 'Transferencia entrante')`,
        [companyId, transfer.product_id, transfer.from_warehouse_id, transfer.quantity, transfer.id, transfer.to_warehouse_id]
      );
    }

    return successResponse(rows[0]);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
