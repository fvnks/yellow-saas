import { query } from '@/api/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { rows: projects } = await query(
      `SELECT id, name, code, description, status, progress, start_date, end_date,
        portal_show_budget, portal_show_costs, budget
       FROM projects WHERE portal_token = $1 AND portal_enabled = true AND company_id IS NOT NULL`,
      [params.token]
    );

    if (projects.length === 0) {
      return NextResponse.json({ error: 'Project not found or portal disabled' }, { status: 404 });
    }

    const project = projects[0];

    const { rows: milestones } = await query(
      `SELECT name, description, due_date, status, completed_at
       FROM project_milestones WHERE project_id = $1 ORDER BY due_date`,
      [project.id]
    );

    const { rows: tasks } = await query(
      `SELECT name, status, progress
       FROM project_tasks WHERE project_id = $1 ORDER BY due_date`,
      [project.id]
    );

    const { rows: documents } = await query(
      `SELECT name, file_url, file_type, category, created_at
       FROM project_documents WHERE project_id = $1 ORDER BY created_at DESC`,
      [project.id]
    );

    const { rows: changeOrders } = await query(
      `SELECT order_number, title, status, type, budget_impact, timeline_impact_days, created_at
       FROM project_change_orders WHERE project_id = $1 ORDER BY created_at DESC`,
      [project.id]
    );

    let costs = null;
    if (project.portal_show_costs) {
      const { rows: costsData } = await query(
        `SELECT category, description, amount, cost_date
         FROM project_costs WHERE project_id = $1 ORDER BY cost_date DESC`,
        [project.id]
      );
      costs = costsData;
    }

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;

    return NextResponse.json({
      project: {
        name: project.name,
        code: project.code,
        description: project.description,
        status: project.status,
        progress: project.progress,
        start_date: project.start_date,
        end_date: project.end_date,
        budget: project.portal_show_budget ? project.budget : null,
      },
      summary: {
        total_tasks: totalTasks,
        done_tasks: doneTasks,
        total_milestones: milestones.length,
        done_milestones: milestones.filter(m => m.status === 'completed').length,
      },
      milestones,
      tasks: tasks.map(t => ({ name: t.name, status: t.status, progress: t.progress })),
      documents: documents.map(d => ({ name: d.name, file_url: d.file_url, file_type: d.file_type, category: d.category, created_at: d.created_at })),
      change_orders: changeOrders.map(co => ({
        order_number: co.order_number, title: co.title, status: co.status, type: co.type,
        budget_impact: project.portal_show_costs ? co.budget_impact : null,
        timeline_impact_days: co.timeline_impact_days, created_at: co.created_at,
      })),
      costs,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
