import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string; kitId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { name, description, is_active, items } = body;

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 3;

    if (name !== undefined) { fields.push(`name = $${idx}`); values.push(name); idx++; }
    if (description !== undefined) { fields.push(`description = $${idx}`); values.push(description); idx++; }
    if (is_active !== undefined) { fields.push(`is_active = $${idx}`); values.push(is_active); idx++; }

    if (fields.length > 0) {
      await query(
        `UPDATE product_kits SET ${fields.join(', ')} WHERE id = $1 AND company_id = $2`,
        [params.kitId, companyId, ...values]
      );
    }

    if (Array.isArray(items)) {
      await query('DELETE FROM kit_items WHERE kit_id = $1 AND company_id = $2', [params.kitId, companyId]);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await query(
          `INSERT INTO kit_items (company_id, kit_id, product_id, quantity, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [companyId, params.kitId, item.product_id, item.quantity || 1, i]
        );
      }
    }

    const { rows } = await query(
      `SELECT pk.*, p.name as product_name, p.sku
       FROM product_kits pk JOIN products p ON p.id = pk.product_id
       WHERE pk.id = $1 AND pk.company_id = $2`,
      [params.kitId, companyId]
    );

    if (rows.length === 0) return errorResponse('Kit not found', 404);
    return successResponse(rows[0]);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; kitId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    await query('DELETE FROM kit_items WHERE kit_id = $1 AND company_id = $2', [params.kitId, companyId]);
    await query('DELETE FROM product_kits WHERE id = $1 AND company_id = $2', [params.kitId, companyId]);
    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
