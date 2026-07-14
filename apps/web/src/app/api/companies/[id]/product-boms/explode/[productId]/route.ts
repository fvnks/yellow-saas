import { query } from '../../../../../../lib/db';
import { getCompanyId, successResponse, errorResponse } from '../../../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const quantity = parseFloat(url.searchParams.get('quantity') || '1');

    async function explodeBOM(productId: string, qty: number, level: number = 0, path: string[] = []): Promise<any[]> {
      if (path.includes(productId)) {
        console.warn(`Circular reference detected for product ${productId}`);
        return [];
      }
      if (level > 10) {
        console.warn(`Max recursion depth reached for product ${productId}`);
        return [];
      }

      const result = await query(
        `SELECT pb.*, c.id as component_id, c.name as component_name, c.sku as component_sku, c.unit_of_measure as component_uom, c.cost_price as component_cost
         FROM product_boms pb
         JOIN products c ON pb.component_product_id = c.id
         WHERE pb.parent_product_id = $1 AND pb.company_id = $2`,
        [productId, companyId]
      );

      const components: any[] = [];
      for (const row of result.rows) {
        const componentQty = qty * parseFloat(row.quantity.toString()) * (1 + parseFloat(row.scrap_percent.toString()) / 100);
        const componentCost = parseFloat(row.component_cost.toString()) * componentQty;

        const component = {
          level,
          component_id: row.component_id,
          component_name: row.component_name,
          component_sku: row.component_sku,
          component_uom: row.component_uom,
          quantity: componentQty,
          unit_cost: parseFloat(row.component_cost.toString()),
          total_cost: componentCost,
          scrap_percent: parseFloat(row.scrap_percent.toString()),
          is_optional: row.is_optional,
          children: await explodeBOM(row.component_id, componentQty, level + 1, [...path, productId]),
        };
        components.push(component);
      }

      return components;
    }

    const productCheck = await query('SELECT id, name, sku FROM products WHERE id = $1 AND company_id = $2', [params.productId, companyId]);
    if (productCheck.rows.length === 0) return errorResponse('Product not found', 404);

    const components = await explodeBOM(params.productId, quantity);
    
    const totalCost = components.reduce((sum, c) => sum + c.total_cost + c.children.reduce((s: number, ch: any) => s + ch.total_cost, 0), 0);

    return successResponse({
      parent_product: productCheck.rows[0],
      quantity,
      components,
      total_estimated_cost: totalCost,
    });
  } catch (err) {
    console.error('Explode BOM error:', err);
    return errorResponse('Internal server error', 500);
  }
}