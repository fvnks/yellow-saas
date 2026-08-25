import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string; batchId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT pb.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) as product,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse
       FROM product_batches pb
       JOIN products p ON pb.product_id = p.id
       JOIN warehouses w ON pb.warehouse_id = w.id
       WHERE pb.id = $1 AND pb.company_id = $2`,
      [params.batchId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Batch not found', 404);
    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Get batch error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; batchId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { quantity, expiry_date, manufacturing_date, status, notes } = body;

    const result = await query(
      `UPDATE product_batches SET
        quantity = COALESCE($1, quantity),
        expiry_date = COALESCE($2, expiry_date),
        manufacturing_date = COALESCE($3, manufacturing_date),
        status = COALESCE($4, status),
        notes = COALESCE($5, notes),
        updated_at = now()
       WHERE id = $6 AND company_id = $7
       RETURNING *`,
      [quantity, expiry_date, manufacturing_date, status, notes, params.batchId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Batch not found', 404);
    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Update batch error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; batchId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `DELETE FROM product_batches WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.batchId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Batch not found', 404);
    return successResponse({ message: 'Batch deleted' });
  } catch (err) {
    console.error('Delete batch error:', err);
    return errorResponse('Internal server error', 500);
  }
}