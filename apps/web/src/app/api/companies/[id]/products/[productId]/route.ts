import { query } from '../../../../lib/db';
import { getCompanyId, successResponse, errorResponse } from '../../../../lib/helpers';
import { NextRequest } from 'next/server';

async function trackPriceChange(companyId: string, productId: string, oldProduct: any, body: any) {
  const tracks: Promise<any>[] = [];
  if (body.cost_price !== undefined && body.cost_price !== oldProduct.cost_price) {
    tracks.push(query(
      `INSERT INTO product_price_history (company_id, product_id, price_type, old_price, new_price) VALUES ($1, $2, 'cost', $3, $4)`,
      [companyId, productId, oldProduct.cost_price, body.cost_price]
    ));
  }
  if (body.sale_price !== undefined && body.sale_price !== oldProduct.sale_price) {
    tracks.push(query(
      `INSERT INTO product_price_history (company_id, product_id, price_type, old_price, new_price) VALUES ($1, $2, 'sale', $3, $4)`,
      [companyId, productId, oldProduct.sale_price, body.sale_price]
    ));
  }
  await Promise.all(tracks);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT p.*,
        CASE WHEN cc.id IS NOT NULL THEN json_build_object('id', cc.id, 'name', cc.name, 'code', cc.code) ELSE NULL END as cost_center,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sl.id,
            'warehouse_id', sl.warehouse_id,
            'quantity', sl.quantity,
            'available_quantity', sl.available_quantity,
            'warehouse', json_build_object('id', w.id, 'name', w.name, 'code', w.code)
          ))
          FROM stock_levels sl
          JOIN warehouses w ON sl.warehouse_id = w.id
          WHERE sl.product_id = p.id
          ), '[]'
        ) as stock_levels
       FROM products p
       LEFT JOIN cost_centers cc ON p.cost_center_id = cc.id
       WHERE p.id = $1 AND p.company_id = $2`,
      [params.productId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Product not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to fetch product', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const existing = await query('SELECT cost_price, sale_price FROM products WHERE id = $1 AND company_id = $2', [params.productId, companyId]);
    if (existing.rows.length > 0) {
      await trackPriceChange(companyId, params.productId, existing.rows[0], body);
    }

    const result = await query(
      `UPDATE products SET
        sku = $1, name = $2, category_id = $3, description = $4, type = $5,
        unit_of_measure = $6, cost_price = $7, sale_price = $8, min_stock = $9,
        max_stock = $10, track_stock = $11, barcode = $12, tax_id = $13,
        is_active = $14, cost_center_id = $15, image_url = $16, updated_at = NOW()
       WHERE id = $17 AND company_id = $18
       RETURNING *`,
      [body.sku, body.name, body.category_id, body.description, body.type,
       body.unit_of_measure, body.cost_price, body.sale_price, body.min_stock,
       body.max_stock, body.track_stock, body.barcode, body.tax_id,
       body.is_active, body.cost_center_id || null, body.image_url || null, params.productId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Product not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to update product', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const stockCheck = await query(
      'SELECT id FROM stock_movements WHERE product_id = $1 AND company_id = $2 LIMIT 1',
      [params.productId, companyId]
    );

    if (stockCheck.rows.length > 0) {
      return errorResponse('Cannot delete product with existing stock movements', 400);
    }

    const result = await query(
      'DELETE FROM products WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.productId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Product not found', 404);

    return successResponse({ message: 'Product deleted successfully' });
  } catch {
    return errorResponse('Failed to delete product', 500);
  }
}
