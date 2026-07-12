import { query } from '../../../../lib/db';
import { getCompanyId, successResponse, errorResponse, isDemoMode } from '../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    if (isDemoMode) {
      const demoProducts: Record<string, unknown> = {
        '1': { id: '1', sku: 'LP-HP-450', name: 'Laptop HP ProBook 450', description: 'Laptop empresarial', type: 'product', unit_of_measure: 'un', cost_price: 450000, sale_price: 650000, min_stock: 5, max_stock: 50, track_stock: true, barcode: '7891234567890', is_active: true },
        '2': { id: '2', sku: 'MS-LG-MX3', name: 'Mouse Logitech MX Master 3S', description: 'Mouse inalámbrico', type: 'product', unit_of_measure: 'un', cost_price: 55000, sale_price: 89000, min_stock: 10, max_stock: 200, track_stock: true, barcode: '7891234567891', is_active: true },
        '3': { id: '3', sku: 'MN-DELL-27', name: 'Monitor Dell 27" 4K', description: 'Monitor 4K', type: 'product', unit_of_measure: 'un', cost_price: 280000, sale_price: 420000, min_stock: 3, max_stock: 30, track_stock: true, barcode: '7891234567892', is_active: true },
        '4': { id: '4', sku: 'KB-KC-K2', name: 'Teclado Mecánico Keychron K2', description: 'Teclado wireless', type: 'product', unit_of_measure: 'un', cost_price: 60000, sale_price: 95000, min_stock: 5, max_stock: 60, track_stock: true, barcode: '7891234567893', is_active: true },
        '5': { id: '5', sku: 'SSD-SAM-980', name: 'Disco SSD Samsung 980 PRO 1TB', description: 'SSD NVMe', type: 'product', unit_of_measure: 'un', cost_price: 70000, sale_price: 110000, min_stock: 10, max_stock: 100, track_stock: true, barcode: '7891234567894', is_active: true },
      };
      const product = demoProducts[params.productId];
      if (!product) return errorResponse('Product not found', 404);
      return successResponse(product);
    }

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT p.*,
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
    if (isDemoMode) {
      const body = await request.json();
      return successResponse({ id: params.productId, ...body, updated_at: new Date().toISOString() });
    }

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const result = await query(
      `UPDATE products SET
        sku = $1, name = $2, category_id = $3, description = $4, type = $5,
        unit_of_measure = $6, cost_price = $7, sale_price = $8, min_stock = $9,
        max_stock = $10, track_stock = $11, barcode = $12, tax_id = $13,
        is_active = $14, updated_at = NOW()
       WHERE id = $15 AND company_id = $16
       RETURNING *`,
      [body.sku, body.name, body.category_id, body.description, body.type,
       body.unit_of_measure, body.cost_price, body.sale_price, body.min_stock,
       body.max_stock, body.track_stock, body.barcode, body.tax_id,
       body.is_active, params.productId, companyId]
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
    if (isDemoMode) {
      return successResponse({ message: 'Product deleted successfully' });
    }

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
