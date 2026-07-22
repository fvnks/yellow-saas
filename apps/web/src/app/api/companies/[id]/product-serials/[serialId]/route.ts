import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string; serialId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { status, notes, warehouse_id } = body;

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 3;

    if (status) { fields.push(`status = $${idx}`); values.push(status); idx++; }
    if (notes !== undefined) { fields.push(`notes = $${idx}`); values.push(notes); idx++; }
    if (warehouse_id) { fields.push(`warehouse_id = $${idx}`); values.push(warehouse_id); idx++; }

    if (fields.length === 0) return errorResponse('No valid fields', 400);

    const { rows } = await query(
      `UPDATE product_serials SET ${fields.join(', ')}
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [params.serialId, companyId, ...values]
    );

    if (rows.length === 0) return errorResponse('Not found', 404);
    return successResponse(rows[0]);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; serialId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    await query('DELETE FROM product_serials WHERE id = $1 AND company_id = $2', [params.serialId, companyId]);
    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
