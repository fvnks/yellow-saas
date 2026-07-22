import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; segmentId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'SELECT * FROM customer_segments WHERE id = $1 AND company_id = $2',
      [params.segmentId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Segment not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to fetch segment', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; segmentId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const result = await query(
      `UPDATE customer_segments SET
        name = $1, description = $2, min_orders = $3, min_revenue = $4, updated_at = NOW()
       WHERE id = $5 AND company_id = $6
       RETURNING *`,
      [body.name, body.description, body.min_orders, body.min_revenue,
       params.segmentId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Segment not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to update segment', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; segmentId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'DELETE FROM customer_segments WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.segmentId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Segment not found', 404);

    return successResponse({ message: 'Segment deleted successfully' });
  } catch {
    return errorResponse('Failed to delete segment', 500);
  }
}
