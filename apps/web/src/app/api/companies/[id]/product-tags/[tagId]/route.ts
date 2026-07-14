import { query } from '@/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; tagId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, color, is_active } = body;

    if (name) {
      const existing = await query(
        `SELECT id FROM product_tags WHERE company_id = $1 AND LOWER(name) = LOWER($2) AND id != $3`,
        [companyId, name, params.tagId]
      );
      if (existing.rows.length > 0) {
        return errorResponse('A tag with this name already exists', 400);
      }
    }

    const result = await query(
      `UPDATE product_tags SET
        name = COALESCE($1, name),
        color = COALESCE($2, color),
        is_active = COALESCE($3, is_active)
       WHERE id = $4 AND company_id = $5
       RETURNING *`,
      [name || null, color || null, is_active ?? null, params.tagId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Tag not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; tagId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `DELETE FROM product_tags WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.tagId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Tag not found', 404);
    return successResponse({ message: 'Tag deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
