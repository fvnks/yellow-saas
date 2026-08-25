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
      `SELECT * FROM project_milestones WHERE project_id = $1 AND company_id = $2 ORDER BY sort_order, due_date`,
      [params.projectId, companyId]
    );
    return successResponse(result.rows);
  } catch { return errorResponse('Internal server error', 500); }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);
    const body = await request.json();
    if (!body.name || !body.due_date) return errorResponse('Name and due_date are required', 400);

    const result = await query(
      `INSERT INTO project_milestones (company_id, project_id, name, description, due_date, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [companyId, params.projectId, body.name, body.description || null, body.due_date, body.sort_order || 0]
    );
    return successResponse(result.rows[0], 201);
  } catch { return errorResponse('Internal server error', 500); }
}
