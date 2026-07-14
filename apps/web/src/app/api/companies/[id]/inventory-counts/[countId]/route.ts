import { query } from '@/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; countId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT ic.*,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', ici.id,
            'product_id', ici.product_id,
            'system_quantity', ici.system_quantity,
            'counted_quantity', ici.counted_quantity,
            'difference', ici.difference,
            'status', ici.status,
            'notes', ici.notes,
            'product', json_build_object('id', p.id, 'name', p.name, 'sku', p.sku, 'cost_price', p.cost_price)
          ) ORDER BY p.name)
          FROM inventory_count_items ici
          JOIN products p ON ici.product_id = p.id
          WHERE ici.count_id = ic.id
          ), '[]'
        ) as items
       FROM inventory_counts ic
       JOIN warehouses w ON ic.warehouse_id = w.id
       WHERE ic.id = $1 AND ic.company_id = $2`,
      [params.countId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Count not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to fetch count', 500);
  }
}
