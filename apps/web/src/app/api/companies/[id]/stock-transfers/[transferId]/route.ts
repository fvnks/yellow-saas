import { query } from '../../../../lib/db';
import { getCompanyId, successResponse, errorResponse } from '../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; transferId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT st.*,
        json_build_object('id', sw.id, 'name', sw.name, 'code', sw.code) as source_warehouse,
        json_build_object('id', dw.id, 'name', dw.name, 'code', dw.code) as destination_warehouse,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sti.id,
            'product_id', sti.product_id,
            'quantity', sti.quantity,
            'unit_cost', sti.unit_cost,
            'notes', sti.notes,
            'product', json_build_object('id', p.id, 'name', p.name, 'sku', p.sku)
          ))
          FROM stock_transfer_items sti
          JOIN products p ON sti.product_id = p.id
          WHERE sti.transfer_id = st.id
          ), '[]'
        ) as items
       FROM stock_transfers st
       JOIN warehouses sw ON st.source_warehouse_id = sw.id
       JOIN warehouses dw ON st.destination_warehouse_id = dw.id
       WHERE st.id = $1 AND st.company_id = $2`,
      [params.transferId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Transfer not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to fetch transfer', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; transferId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const result = await query(
      `UPDATE stock_transfers SET
        notes = COALESCE($1, notes),
        updated_at = NOW()
       WHERE id = $2 AND company_id = $3
       RETURNING *`,
      [body.notes || null, params.transferId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Transfer not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to update transfer', 500);
  }
}
