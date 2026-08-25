import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string; productId: string; imageId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();

    if (body.is_primary) {
      await query(
        'UPDATE product_images SET is_primary = FALSE WHERE company_id = $1 AND product_id = $2',
        [companyId, params.productId]
      );
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 3;

    for (const [key, value] of Object.entries(body)) {
      if (['url', 'alt_text', 'sort_order', 'is_primary'].includes(key)) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) return errorResponse('No valid fields', 400);

    const { rows } = await query(
      `UPDATE product_images SET ${fields.join(', ')}
       WHERE id = $1 AND company_id = $2 AND product_id = $3
       RETURNING *`,
      [params.imageId, companyId, params.productId, ...values]
    );

    if (rows.length === 0) return errorResponse('Image not found', 404);
    return successResponse(rows[0]);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; productId: string; imageId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    await query(
      'DELETE FROM product_images WHERE id = $1 AND company_id = $2 AND product_id = $3',
      [params.imageId, companyId, params.productId]
    );
    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
