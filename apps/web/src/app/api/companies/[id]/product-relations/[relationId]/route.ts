import { query } from '@/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; relationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `DELETE FROM product_relations WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.relationId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Product relation not found', 404);
    return successResponse({ message: 'Product relation deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
