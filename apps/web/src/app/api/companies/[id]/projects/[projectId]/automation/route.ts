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
      'SELECT * FROM project_automation_rules WHERE project_id = $1 AND company_id = $2 ORDER BY created_at DESC',
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
    const { name, trigger_type, trigger_value, action_type, action_config } = body;

    if (!name || !trigger_type || !action_type || !action_config) {
      return errorResponse('name, trigger_type, action_type, action_config required', 400);
    }

    const result = await query(
      `INSERT INTO project_automation_rules (company_id, project_id, name, trigger_type, trigger_value, action_type, action_config)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [companyId, params.projectId, name, trigger_type, trigger_value || null, action_type, JSON.stringify(action_config)]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { rule_id, is_active } = body;

    if (!rule_id) return errorResponse('rule_id required', 400);

    const result = await query(
      `UPDATE project_automation_rules SET is_active = $1 WHERE id = $2 AND project_id = $3 AND company_id = $4 RETURNING *`,
      [is_active, rule_id, params.projectId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Rule not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');
    if (!ruleId) return errorResponse('ruleId required', 400);

    const result = await query(
      'DELETE FROM project_automation_rules WHERE id = $1 AND project_id = $2 AND company_id = $3 RETURNING id',
      [ruleId, params.projectId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Rule not found', 404);

    return successResponse({ message: 'Rule deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
