import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const overdueMilestones = await query(
      `SELECT m.*, p.name as project_name, p.code as project_code
       FROM project_milestones m
       JOIN projects p ON p.id = m.project_id
       WHERE m.company_id = $1 AND m.status = 'pending' AND m.due_date < CURRENT_DATE
       ORDER BY m.due_date ASC LIMIT 10`,
      [companyId]
    );

    const overdueTasks = await query(
      `SELECT t.*, p.name as project_name, p.code as project_code
       FROM project_tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE t.company_id = $1 AND t.status NOT IN ('done')
         AND t.due_date IS NOT NULL AND t.due_date::date < CURRENT_DATE
       ORDER BY t.due_date ASC LIMIT 10`,
      [companyId]
    );

    const budgetAlerts = await query(
      `SELECT p.id, p.name, p.code, p.budget,
        COALESCE(pc.total_costs, 0) as total_costs,
        COALESCE(pe.total_expenses, 0) as total_expenses,
        p.budget - COALESCE(pc.total_costs, 0) - COALESCE(pe.total_expenses, 0) as remaining
       FROM projects p
       LEFT JOIN (
         SELECT project_id, SUM(amount) as total_costs
         FROM project_costs WHERE company_id = $1 GROUP BY project_id
       ) pc ON pc.project_id = p.id
       LEFT JOIN (
         SELECT project_id, SUM(amount) as total_expenses
         FROM project_expenses WHERE company_id = $1 GROUP BY project_id
       ) pe ON pe.project_id = p.id
       WHERE p.company_id = $1 AND p.status = 'active' AND p.budget > 0
         AND (COALESCE(pc.total_costs, 0) + COALESCE(pe.total_expenses, 0)) > p.budget * 0.9
       ORDER BY (COALESCE(pc.total_costs, 0) + COALESCE(pe.total_expenses, 0)) / p.budget DESC
       LIMIT 10`,
      [companyId]
    );

    const notifications = [
      ...overdueMilestones.rows.map((m: any) => ({
        type: 'milestone_overdue',
        severity: 'warning',
        title: `Hito vencido: ${m.name}`,
        description: `Proyecto ${m.project_name} (${m.project_code}) — venció el ${m.due_date}`,
        project_id: m.project_id,
        date: m.due_date,
      })),
      ...overdueTasks.rows.map((t: any) => ({
        type: 'task_overdue',
        severity: 'danger',
        title: `Tarea atrasada: ${t.name}`,
        description: `Proyecto ${t.project_name} (${t.project_code}) — vencía el ${t.due_date}`,
        project_id: t.project_id,
        date: t.due_date,
      })),
      ...budgetAlerts.rows.map((b: any) => {
        const used = Number(b.total_costs) + Number(b.total_expenses);
        const pct = Math.round((used / Number(b.budget)) * 100);
        return {
          type: 'budget_alert',
          severity: pct >= 100 ? 'danger' : 'warning',
          title: `Presupuesto al ${pct}%: ${b.name}`,
          description: `${b.code} — Gastado: $${(used / 1000000).toFixed(1)}M / $${(Number(b.budget) / 1000000).toFixed(1)}M`,
          project_id: b.id,
          date: new Date().toISOString(),
        };
      }),
    ].sort((a, b) => {
      const sev = { danger: 0, warning: 1, info: 2 };
      return (sev[a.severity as keyof typeof sev] || 2) - (sev[b.severity as keyof typeof sev] || 2);
    });

    return successResponse({ notifications, counts: {
      overdue_milestones: overdueMilestones.rows.length,
      overdue_tasks: overdueTasks.rows.length,
      budget_alerts: budgetAlerts.rows.length,
    }});
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
