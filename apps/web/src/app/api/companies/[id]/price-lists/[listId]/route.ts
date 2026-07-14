import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; listId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT pl.*,
        (SELECT json_agg(json_build_object(
          'id', pli.id, 'product_id', pli.product_id, 'variant_id', pli.variant_id, 'price', pli.price, 'min_quantity', pli.min_quantity,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = pli.product_id)
        )) FROM price_list_items pli WHERE pli.price_list_id = pl.id) as items
       FROM price_lists pl
       WHERE pl.id = $1 AND pl.company_id = $2`,
      [params.listId, companyId]
    );

    if (!rows[0]) return errorResponse('Price list not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch price list', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; listId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    if (body.is_default) {
      await query(
        `UPDATE price_lists SET is_default = false WHERE company_id = $1 AND is_default = true`,
        [companyId]
      );
    }

    const { rows } = await query(
      `UPDATE price_lists SET
        name = $1, description = $2, is_default = $3, currency = $4,
        adjustment_type = $5, adjustment_value = $6, updated_at = NOW()
       WHERE id = $7 AND company_id = $8
       RETURNING *`,
      [
        body.name, body.description, body.is_default, body.currency,
        body.adjustment_type, body.adjustment_value, params.listId, companyId,
      ]
    );

    if (!rows[0]) return errorResponse('Price list not found', 404);

    if (body.items) {
      await query(
        `DELETE FROM price_list_items WHERE price_list_id = $1 AND company_id = $2`,
        [params.listId, companyId]
      );

      if (body.items.length > 0) {
        for (const item of body.items) {
          await query(
            `INSERT INTO price_list_items (price_list_id, company_id, product_id, variant_id, price, min_quantity)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [params.listId, companyId, item.product_id, item.variant_id || null, item.price, item.min_quantity || 1]
          );
        }
      }
    }

    const { rows: updated } = await query(
      `SELECT pl.*,
        (SELECT json_agg(json_build_object(
          'id', pli.id, 'product_id', pli.product_id, 'variant_id', pli.variant_id, 'price', pli.price, 'min_quantity', pli.min_quantity,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = pli.product_id)
        )) FROM price_list_items pli WHERE pli.price_list_id = pl.id) as items
       FROM price_lists pl
       WHERE pl.id = $1 AND pl.company_id = $2`,
      [params.listId, companyId]
    );

    return successResponse(updated[0]);
  } catch {
    return errorResponse('Failed to update price list', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; listId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: list } = await query(
      `SELECT is_default FROM price_lists WHERE id = $1 AND company_id = $2`,
      [params.listId, companyId]
    );

    if (!list[0]) return errorResponse('Price list not found', 404);

    if (list[0].is_default) {
      return errorResponse('Cannot delete default price list', 400);
    }

    await query(`DELETE FROM price_list_items WHERE price_list_id = $1 AND company_id = $2`, [params.listId, companyId]);
    await query(`DELETE FROM price_lists WHERE id = $1 AND company_id = $2`, [params.listId, companyId]);

    return successResponse({ message: 'Price list deleted successfully' });
  } catch {
    return errorResponse('Failed to delete price list', 500);
  }
}
