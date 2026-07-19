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
      `SELECT pc.*,
        SUM(pc.amount) OVER (PARTITION BY pc.source_type) as source_total,
        SUM(pc.amount) OVER () as grand_total
       FROM project_costs pc
       WHERE pc.project_id = $1 AND pc.company_id = $2
       ORDER BY pc.cost_date DESC`,
      [params.projectId, companyId]
    );

    const summary = await query(
      `SELECT source_type, SUM(amount) as total, COUNT(*) as count
       FROM project_costs WHERE project_id = $1 AND company_id = $2
       GROUP BY source_type ORDER BY total DESC`,
      [params.projectId, companyId]
    );

    return successResponse({ costs: result.rows, summary: summary.rows });
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
    if (!body.source_type || !body.category || !body.amount || !body.cost_date) {
      return errorResponse('source_type, category, amount, and cost_date are required', 400);
    }

    const result = await query(
      `INSERT INTO project_costs (company_id, project_id, source_type, source_id, category, description, amount, cost_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [companyId, params.projectId, body.source_type, body.source_id || null,
       body.category, body.description || null, body.amount, body.cost_date]
    );
    return successResponse(result.rows[0], 201);
  } catch { return errorResponse('Internal server error', 500); }
}
