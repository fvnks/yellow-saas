import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; countId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `UPDATE inventory_counts SET status = 'in_progress', started_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND company_id = $2 AND status = 'draft'
       RETURNING *`,
      [params.countId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Count not found or cannot be started', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
