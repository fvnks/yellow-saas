import { query } from '../../../../lib/db';
import { getCompanyId, successResponse, errorResponse } from '../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; serialId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { status, notes } = body;

    if (status) {
      const validStatuses = ['available', 'sold', 'reserved', 'damaged', 'returned'];
      if (!validStatuses.includes(status)) {
        return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }
    }

    const result = await query(
      `UPDATE product_serials SET
        status = COALESCE($1, status),
        notes = COALESCE($2, notes)
       WHERE id = $3 AND company_id = $4
       RETURNING *`,
      [status || null, notes || null, params.serialId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Serial not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; serialId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `DELETE FROM product_serials WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.serialId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Serial not found', 404);
    return successResponse({ message: 'Serial deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
