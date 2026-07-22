import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: kits } = await query(
      `SELECT pk.*,
        p.name as product_name, p.sku, p.sale_price
       FROM product_kits pk
       JOIN products p ON p.id = pk.product_id
       WHERE pk.company_id = $1
       ORDER BY pk.name`,
      [companyId]
    );

    for (const kit of kits) {
      const { rows: items } = await query(
        `SELECT ki.*, p.name as product_name, p.sku, p.cost_price
         FROM kit_items ki
         JOIN products p ON p.id = ki.product_id
         WHERE ki.kit_id = $1 AND ki.company_id = $2
         ORDER BY ki.sort_order`,
        [kit.id, companyId]
      );
      kit.items = items;
    }

    return successResponse(kits);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { product_id, name, description, items = [] } = body;

    if (!product_id || !name) {
      return errorResponse('product_id and name required', 400);
    }

    const { rows: kit } = await query(
      `INSERT INTO product_kits (company_id, product_id, name, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [companyId, product_id, name, description || '']
    );

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await query(
        `INSERT INTO kit_items (company_id, kit_id, product_id, quantity, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [companyId, kit[0].id, item.product_id, item.quantity || 1, i]
      );
    }

    return successResponse(kit[0], 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
