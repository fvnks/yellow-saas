import { NextResponse } from 'next/server';
import { query } from '@/app/api/lib/db';
import { successResponse, errorResponse } from '@/app/api/lib/helpers';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const url = new URL(request.url);
    const company_id = url.searchParams.get('company_id');

    if (!company_id) {
      return errorResponse('company_id is required', 400);
    }

    const { rows } = await query(
      `DELETE FROM auto_work_order_items
       WHERE id = $1 AND work_order_id = $2 AND company_id = $3
       RETURNING id`,
      [params.itemId, params.id, company_id]
    );

    if (!rows[0]) {
      return errorResponse('Item not found', 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Error deleting order item:', error);
    return errorResponse('Failed to delete order item', 500);
  }
}
