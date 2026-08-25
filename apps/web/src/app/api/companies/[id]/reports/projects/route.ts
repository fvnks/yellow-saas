import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const projectFilter = projectId ? `AND t.project_id = '${projectId}'` : '';

    const { rows: employeeHours } = await query(`
      SELECT
        e.id,
        COALESCE(e.first_name || ' ' || e.last_name, 'Sin asignar') as name,
        COUNT(DISTINCT t.project_id) as project_count,
        COALESCE(SUM(t.hours), 0) as total_hours,
        COUNT(DISTINCT t.date) as active_days
      FROM employees e
      LEFT JOIN project_timesheets t ON t.employee_id = e.id
        AND t.date >= CURRENT_DATE - INTERVAL '30 days'
        ${projectFilter.replace('AND t.project_id', 'AND t.project_id')}
      WHERE e.company_id = $1
      GROUP BY e.id, e.first_name, e.last_name
      HAVING COALESCE(SUM(t.hours), 0) > 0
      ORDER BY total_hours DESC
    `, [companyId]);

    const { rows: projectHours } = await query(`
      SELECT
        p.id, p.name, p.code,
        COALESCE(SUM(t.hours), 0) as total_hours,
        COUNT(DISTINCT t.employee_id) as contributor_count
      FROM projects p
      LEFT JOIN project_timesheets t ON t.project_id = p.id
        AND t.date >= CURRENT_DATE - INTERVAL '30 days'
      WHERE p.company_id = $1
      GROUP BY p.id, p.name, p.code
      HAVING COALESCE(SUM(t.hours), 0) > 0
      ORDER BY total_hours DESC
      LIMIT 10
    `, [companyId]);

    const { rows: taskStatus } = await query(`
      SELECT
        p.id as project_id, p.name as project_name,
        COUNT(*) FILTER (WHERE t.status = 'todo') as todo_count,
        COUNT(*) FILTER (WHERE t.status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE t.status = 'review') as review_count,
        COUNT(*) FILTER (WHERE t.status = 'done') as done_count,
        COUNT(*) as total
      FROM projects p
      LEFT JOIN project_tasks t ON t.project_id = p.id
      WHERE p.company_id = $1
      GROUP BY p.id, p.name
    `, [companyId]);

    const { rows: weeklyTrend } = await query(`
      SELECT
        DATE_TRUNC('week', date) as week,
        SUM(hours) as total_hours,
        COUNT(DISTINCT employee_id) as employee_count
      FROM project_timesheets
      WHERE company_id = $1 AND date >= CURRENT_DATE - INTERVAL '12 weeks'
      GROUP BY DATE_TRUNC('week', date)
      ORDER BY week
    `, [companyId]);

    const totalAvailableHours = employeeHours.length * 40 * 4; // 4 weeks * 40h/week
    const totalUsedHours = employeeHours.reduce((sum, e) => sum + parseFloat(e.total_hours), 0);
    const utilizationRate = totalAvailableHours > 0 ? Math.round((totalUsedHours / totalAvailableHours) * 100) : 0;

    return successResponse({
      employees: employeeHours,
      projects: projectHours,
      taskStatus,
      weeklyTrend,
      summary: {
        total_employees: employeeHours.length,
        total_hours: totalUsedHours,
        utilization_rate: utilizationRate,
        avg_hours_per_employee: employeeHours.length > 0 ? Math.round(totalUsedHours / employeeHours.length) : 0,
      },
    });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
