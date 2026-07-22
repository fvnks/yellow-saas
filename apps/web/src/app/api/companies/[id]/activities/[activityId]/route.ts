import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT a.*,
        COALESCE(p.first_name || ' ' || p.last_name, 'Sin asignar') as assigned_name
       FROM activities a
       LEFT JOIN profiles p ON a.assigned_to = p.id
       WHERE a.id = $1 AND a.company_id = $2`,
      [params.activityId, companyId]
    );

    if (!rows[0]) return errorResponse('Activity not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch activity', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { type, subject, description, due_date, completed_at } = body;

    const { rows } = await query(
      `UPDATE activities SET
        type = COALESCE($1, type),
        subject = COALESCE($2, subject),
        description = COALESCE($3, description),
        due_date = COALESCE($4, due_date),
        completed_at = COALESCE($5, completed_at)
       WHERE id = $6 AND company_id = $7
       RETURNING *`,
      [type, subject, description, due_date, completed_at, params.activityId, companyId]
    );

    if (!rows[0]) return errorResponse('Activity not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update activity', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `DELETE FROM activities WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.activityId, companyId]
    );

    if (!rows[0]) return errorResponse('Activity not found', 404);

    return successResponse({ message: 'Activity deleted successfully' });
  } catch {
    return errorResponse('Failed to delete activity', 500);
  }
}
