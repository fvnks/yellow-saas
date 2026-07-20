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
      `SELECT r.*, pr.full_name as owner_name
       FROM project_risks r
       LEFT JOIN profiles pr ON r.owner_id = pr.id
       WHERE r.project_id = $1 AND r.company_id = $2
       ORDER BY
         CASE r.probability WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         CASE r.impact WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END DESC`,
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
    const { name, description, probability, impact, mitigation_plan, owner_id, identified_date } = body;

    if (!name) return errorResponse('Name is required', 400);

    const result = await query(
      `INSERT INTO project_risks (company_id, project_id, name, description, probability, impact, mitigation_plan, owner_id, identified_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [companyId, params.projectId, name, description || null, probability || 'medium', impact || 'medium',
       mitigation_plan || null, owner_id || null, identified_date || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
