import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { trigger_type, trigger_value, task_id } = body;

    const rules = await query(
      `SELECT * FROM project_automation_rules
       WHERE project_id = $1 AND company_id = $2 AND is_active = true AND trigger_type = $3
         AND (trigger_value = $4 OR trigger_value IS NULL)`,
      [params.projectId, companyId, trigger_type, trigger_value || null]
    );

    let executed = 0;

    for (const rule of rules.rows) {
      const config = typeof rule.action_config === 'string' ? JSON.parse(rule.action_config) : rule.action_config;

      switch (rule.action_type) {
        case 'create_task':
          await query(
            `INSERT INTO project_tasks (company_id, project_id, name, description, priority, status, assignee_id)
             VALUES ($1, $2, $3, $4, $5, 'todo', $6)`,
            [companyId, params.projectId, config.name || 'Tarea automática', config.description || null,
             config.priority || 'medium', config.assignee_id || null]
          );
          break;

        case 'change_status':
          if (task_id && config.new_status) {
            await query(
              'UPDATE project_tasks SET status = $1 WHERE id = $2 AND company_id = $3',
              [config.new_status, task_id, companyId]
            );
          }
          break;

        case 'assign_task':
          if (task_id && config.assignee_id) {
            await query(
              'UPDATE project_tasks SET assignee_id = $1 WHERE id = $2 AND company_id = $3',
              [config.assignee_id, task_id, companyId]
            );
          }
          break;

        case 'send_notification':
          if (config.user_id) {
            await query(
              `INSERT INTO project_notifications (company_id, project_id, user_id, type, title, message, entity_type, entity_id)
               VALUES ($1, $2, $3, 'status_change', $4, $5, 'task', $6)`,
              [companyId, params.projectId, config.user_id,
               config.title || 'Notificación automática',
               config.message || 'Regla de automatización ejecutada',
               task_id || null]
            );
          }
          break;
      }

      await query(
        'UPDATE project_automation_rules SET last_triggered_at = now(), trigger_count = trigger_count + 1 WHERE id = $1',
        [rule.id]
      );
      executed++;
    }

    return successResponse({ message: `${executed} rules executed`, executed });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
