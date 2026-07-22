import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string; countId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: count } = await query(
      `SELECT pc.*, w.name as warehouse_name
       FROM physical_counts pc
       JOIN warehouses w ON w.id = pc.warehouse_id
       WHERE pc.id = $1 AND pc.company_id = $2`,
      [params.countId, companyId]
    );

    if (count.length === 0) return errorResponse('Count not found', 404);

    const { rows: items } = await query(
      `SELECT pci.*, p.name as product_name, p.sku
       FROM physical_count_items pci
       JOIN products p ON p.id = pci.product_id
       WHERE pci.count_id = $1
       ORDER BY p.name`,
      [params.countId]
    );

    return successResponse({ ...count[0], items });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string; countId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { status, items } = body;

    if (status) {
      const updates: string[] = ['status = $3'];
      const values: any[] = [params.countId, companyId, status];
      let idx = 4;

      if (status === 'in_progress') {
        updates.push('started_at = NOW()');
      } else if (status === 'completed') {
        updates.push('completed_at = NOW()');
      }

      await query(
        `UPDATE physical_counts SET ${updates.join(', ')} WHERE id = $1 AND company_id = $2`,
        values
      );
    }

    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.id && item.counted_quantity !== undefined) {
          await query(
            `UPDATE physical_count_items
             SET counted_quantity = $1, counted_at = NOW()
             WHERE id = $2 AND company_id = $3`,
            [item.counted_quantity, item.id, companyId]
          );
        }
      }
    }

    const { rows } = await query(
      `SELECT pc.*, w.name as warehouse_name
       FROM physical_counts pc
       JOIN warehouses w ON w.id = pc.warehouse_id
       WHERE pc.id = $1 AND pc.company_id = $2`,
      [params.countId, companyId]
    );

    return successResponse(rows[0]);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
