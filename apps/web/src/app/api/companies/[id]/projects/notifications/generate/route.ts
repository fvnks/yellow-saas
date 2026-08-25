import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    let created = 0;

    const overdueTasks = await query(
      `SELECT t.*, p.name as project_name, t.assignee_id
       FROM project_tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE t.company_id = $1 AND t.due_date < CURRENT_DATE AND t.status NOT IN ('done', 'cancelled')
         AND t.assignee_id IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM project_notifications n
           WHERE n.entity_id = t.id AND n.type = 'task_overdue' AND n.user_id = t.assignee_id
         )`,
      [companyId]
    );

    for (const task of overdueTasks.rows) {
      await query(
        `INSERT INTO project_notifications (company_id, project_id, user_id, type, title, message, entity_type, entity_id)
         VALUES ($1, $2, $3, 'task_overdue', $4, $5, 'task', $6)`,
        [companyId, task.project_id, task.assignee_id,
         `Tarea vencida: ${task.name}`,
         `La tarea "${task.name}" del proyecto "${task.project_name}" vencio el ${task.due_date}`,
         task.id]
      );
      created++;
    }

    const dueSoonTasks = await query(
      `SELECT t.*, p.name as project_name, t.assignee_id
       FROM project_tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE t.company_id = $1 AND t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
         AND t.status NOT IN ('done', 'cancelled')
         AND t.assignee_id IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM project_notifications n
           WHERE n.entity_id = t.id AND n.type = 'task_due_soon' AND n.user_id = t.assignee_id
             AND n.created_at > CURRENT_DATE - INTERVAL '1 day'
         )`,
      [companyId]
    );

    for (const task of dueSoonTasks.rows) {
      await query(
        `INSERT INTO project_notifications (company_id, project_id, user_id, type, title, message, entity_type, entity_id)
         VALUES ($1, $2, $3, 'task_due_soon', $4, $5, 'task', $6)`,
        [companyId, task.project_id, task.assignee_id,
         `Tarea proxima a vencer: ${task.name}`,
         `La tarea "${task.name}" vence el ${task.due_date}`,
         task.id]
      );
      created++;
    }

    const budgetWarnings = await query(
      `SELECT p.*, 
         CASE WHEN p.budget > 0 THEN (COALESCE(spent.total, 0) / p.budget * 100) ELSE 0 END as usage_pct
       FROM projects p
       LEFT JOIN (
         SELECT project_id, SUM(amount) as total
         FROM project_expenses WHERE company_id = $1
         GROUP BY project_id
       ) spent ON spent.project_id = p.id
       WHERE p.company_id = $1 AND p.budget > 0
         AND (spent.total / p.budget * 100) >= 80
         AND NOT EXISTS (
           SELECT 1 FROM project_notifications n
           WHERE n.project_id = p.id AND n.type = 'budget_warning'
             AND n.created_at > CURRENT_DATE - INTERVAL '7 days'
         )`,
      [companyId]
    );

    for (const project of budgetWarnings.rows) {
      const recipients = await query(
        `SELECT DISTINCT t.assignee_id FROM project_tasks t
         WHERE t.project_id = $1 AND t.assignee_id IS NOT NULL
         UNION
         SELECT DISTINCT p.id FROM profiles p WHERE p.company_id = $2 AND p.role IN ('admin', 'manager')`,
        [project.id, companyId]
      );
      for (const r of recipients.rows) {
        await query(
          `INSERT INTO project_notifications (company_id, project_id, user_id, type, title, message, entity_type, entity_id)
           VALUES ($1, $2, $3, 'budget_warning', $4, $5, 'project', $6)`,
          [companyId, project.id, r.assignee_id || r.id,
           `Presupuesto al ${Math.round(project.usage_pct)}%: ${project.name}`,
           `El proyecto "${project.name}" ha usado el ${Math.round(project.usage_pct)}% de su presupuesto`,
           project.id]
        );
        created++;
      }
    }

    return successResponse({ message: `${created} notifications created` });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
