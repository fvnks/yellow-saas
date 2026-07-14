import { query } from '@/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string; variantId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { sku, name, attributes, cost_price, sale_price, barcode, stock_quantity, is_active } = body;

    const result = await query(
      `UPDATE product_variants SET
        sku = COALESCE($1, sku), name = COALESCE($2, name),
        attributes = COALESCE($3, attributes),
        cost_price = COALESCE($4, cost_price), sale_price = COALESCE($5, sale_price),
        barcode = COALESCE($6, barcode), stock_quantity = COALESCE($7, stock_quantity),
        is_active = COALESCE($8, is_active), updated_at = now()
       WHERE id = $9 AND company_id = $10 RETURNING *`,
      [sku, name, attributes ? JSON.stringify(attributes) : null, cost_price, sale_price, barcode, stock_quantity, is_active, params.variantId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Variant not found', 404);
    return successResponse(result.rows[0]);
  } catch (err) {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; variantId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(`DELETE FROM product_variants WHERE id = $1 AND company_id = $2 RETURNING id`, [params.variantId, companyId]);
    if (result.rows.length === 0) return errorResponse('Variant not found', 404);
    return successResponse({ message: 'Variant deleted' });
  } catch (err) {
    return errorResponse('Internal server error', 500);
  }
}
