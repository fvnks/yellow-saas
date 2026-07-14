import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; countId: string; itemId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { counted_quantity, notes } = body;

    if (counted_quantity === undefined || counted_quantity === null) {
      return errorResponse('counted_quantity is required', 400);
    }

    const result = await query(
      `UPDATE inventory_count_items SET
        counted_quantity = $1,
        status = 'counted',
        notes = COALESCE($2, notes)
       WHERE id = $3 AND company_id = $4
       RETURNING *`,
      [counted_quantity, notes || null, params.itemId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Item not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
