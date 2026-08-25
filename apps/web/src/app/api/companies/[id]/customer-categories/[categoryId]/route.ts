import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'SELECT * FROM customer_categories WHERE id = $1 AND company_id = $2',
      [params.categoryId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Category not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to fetch category', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const result = await query(
      `UPDATE customer_categories SET
        name = $1, description = $2, color = $3, updated_at = NOW()
       WHERE id = $4 AND company_id = $5
       RETURNING *`,
      [body.name, body.description, body.color, params.categoryId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Category not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to update category', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'DELETE FROM customer_categories WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.categoryId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Category not found', 404);

    return successResponse({ message: 'Category deleted successfully' });
  } catch {
    return errorResponse('Failed to delete category', 500);
  }
}
