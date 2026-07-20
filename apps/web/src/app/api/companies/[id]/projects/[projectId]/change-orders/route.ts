import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT co.*, pr.full_name as reviewer_name
       FROM project_change_orders co
       LEFT JOIN profiles pr ON co.reviewed_by = pr.id
       WHERE co.project_id = $1 AND co.company_id = $2
       ORDER BY co.created_at DESC`,
      [params.projectId, companyId]
    );

    return successResponse(result.rows);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { title, description, reason, type, budget_impact, timeline_impact_days, requested_by } = body;

    if (!title) return errorResponse('Title is required', 400);

    const result = await query(
      `INSERT INTO project_change_orders (company_id, project_id, title, description, reason, type, budget_impact, timeline_impact_days, requested_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [companyId, params.projectId, title, description || null, reason || null, type || 'scope',
       budget_impact || 0, timeline_impact_days || 0, requested_by || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
