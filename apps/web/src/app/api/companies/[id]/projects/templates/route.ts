import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT pt.*,
        (SELECT COUNT(*) FROM project_template_tasks ptt WHERE ptt.template_id = pt.id) as task_count,
        (SELECT COUNT(*) FROM project_template_milestones ptm WHERE ptm.template_id = pt.id) as milestone_count
       FROM project_templates pt
       WHERE pt.company_id = $1
       ORDER BY pt.created_at DESC`,
      [companyId]
    );

    return successResponse(result.rows);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description, tasks, milestones } = body;

    if (!name) return errorResponse('Template name is required', 400);

    const templateResult = await query(
      `INSERT INTO project_templates (company_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [companyId, name, description || null]
    );

    const template = templateResult.rows[0];

    if (tasks && tasks.length > 0) {
      for (let i = 0; i < tasks.length; i++) {
        await query(
          `INSERT INTO project_template_tasks (company_id, template_id, name, description, priority, estimated_hours, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [companyId, template.id, tasks[i].name, tasks[i].description || null, tasks[i].priority || 'medium', tasks[i].estimated_hours || null, i]
        );
      }
    }

    if (milestones && milestones.length > 0) {
      for (let i = 0; i < milestones.length; i++) {
        await query(
          `INSERT INTO project_template_milestones (company_id, template_id, name, description, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [companyId, template.id, milestones[i].name, milestones[i].description || null, i]
        );
      }
    }

    return successResponse(template, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
