import { query } from '@/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; warehouseId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT w.*,
        (SELECT json_agg(json_build_object(
          'id', sl.id, 'product_id', sl.product_id, 'quantity', sl.quantity, 'available_quantity', sl.available_quantity,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = sl.product_id)
        )) FROM stock_levels sl WHERE sl.warehouse_id = w.id) as stock_summary
       FROM warehouses w
       WHERE w.id = $1 AND w.company_id = $2`,
      [params.warehouseId, companyId]
    );

    if (!rows[0]) return errorResponse('Warehouse not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch warehouse', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; warehouseId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    if (body.is_default) {
      await query(
        `UPDATE warehouses SET is_default = false WHERE company_id = $1 AND is_default = true`,
        [companyId]
      );
    }

    const { rows } = await query(
      `UPDATE warehouses SET
        name = $1, code = $2, address = $3, city = $4, region = $5,
        country = $6, phone = $7, email = $8, is_default = $9, is_active = $10,
        updated_at = NOW()
       WHERE id = $11 AND company_id = $12
       RETURNING *`,
      [
        body.name, body.code, body.address, body.city, body.region,
        body.country, body.phone, body.email, body.is_default, body.is_active,
        params.warehouseId, companyId,
      ]
    );

    if (!rows[0]) return errorResponse('Warehouse not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update warehouse', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; warehouseId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: stockLevels } = await query(
      `SELECT id FROM stock_levels WHERE warehouse_id = $1 AND company_id = $2 AND quantity > 0 LIMIT 1`,
      [params.warehouseId, companyId]
    );

    if (stockLevels.length > 0) {
      return errorResponse('Cannot delete warehouse with existing stock', 400);
    }

    await query(
      `DELETE FROM warehouses WHERE id = $1 AND company_id = $2`,
      [params.warehouseId, companyId]
    );

    return successResponse({ message: 'Warehouse deleted successfully' });
  } catch {
    return errorResponse('Failed to delete warehouse', 500);
  }
}
