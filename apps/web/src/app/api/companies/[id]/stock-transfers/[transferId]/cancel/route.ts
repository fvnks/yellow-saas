import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; transferId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `UPDATE stock_transfers SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND company_id = $2 AND status IN ('draft', 'pending')
       RETURNING *`,
      [params.transferId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Transfer not found or cannot be cancelled', 404);

    return successResponse({ message: 'Transfer cancelled successfully' });
  } catch {
    return errorResponse('Failed to cancel transfer', 500);
  }
}
