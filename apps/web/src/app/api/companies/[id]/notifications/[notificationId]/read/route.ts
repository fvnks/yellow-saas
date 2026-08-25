import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; notificationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.notificationId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Notification not found', 404);

    return successResponse({ message: 'Marked as read' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
