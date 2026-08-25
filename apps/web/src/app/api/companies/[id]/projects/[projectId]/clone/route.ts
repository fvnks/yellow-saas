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
    const { name, code, start_date, end_date, copy_members, copy_allocations, copy_automation, copy_phases, adjust_dates } = body;

    const { rows: origProjects } = await query(
      'SELECT * FROM projects WHERE id = $1 AND company_id = $2',
      [params.projectId, companyId]
    );
    if (origProjects.length === 0) return errorResponse('Project not found', 404);
    const orig = origProjects[0];

    const newStart = start_date ? new Date(start_date) : new Date();
    const origStart = orig.start_date ? new Date(orig.start_date) : new Date();
    const origEnd = orig.end_date ? new Date(orig.end_date) : new Date();
    const origDuration = origEnd.getTime() - origStart.getTime();
    const newEnd = end_date ? new Date(end_date) : new Date(newStart.getTime() + origDuration);

    const { rows: newProjects } = await query(
      `INSERT INTO projects (company_id, name, code, description, customer_id, start_date, end_date, budget, status, project_manager_id, cost_center_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'planning', $9, $10, $11) RETURNING *`,
      [companyId, name || `${orig.name} (Copia)`, code || `${orig.code}-COPY`, orig.description, orig.customer_id,
       newStart.toISOString().split('T')[0], newEnd.toISOString().split('T')[0], orig.budget,
       orig.project_manager_id, orig.cost_center_id, orig.created_by]
    );
    const newProject = newProjects[0];

    const adjustDate = (dateStr: string) => {
      if (!dateStr || !adjust_dates) return dateStr;
      const d = new Date(dateStr);
      const offset = d.getTime() - origStart.getTime();
      return new Date(newStart.getTime() + offset).toISOString().split('T')[0];
    };

    const { rows: origTasks } = await query(
      'SELECT * FROM project_tasks WHERE project_id = $1 AND company_id = $2',
      [params.projectId, companyId]
    );

    const taskIdMap: Record<string, string> = {};
    for (const task of origTasks) {
      const { rows: newTasks } = await query(
        `INSERT INTO project_tasks (company_id, project_id, name, description, status, priority, estimated_hours, parent_id,
          assignee_id, start_date, due_date, recurrence_type, recurrence_interval, recurrence_end_date)
         VALUES ($1, $2, $3, $4, 'todo', $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [companyId, newProject.id, task.name, task.description, task.priority, task.estimated_hours, null,
         task.assignee_id, adjustDate(task.start_date), adjustDate(task.due_date),
         task.recurrence_type || 'none', task.recurrence_interval || 1, adjustDate(task.recurrence_end_date)]
      );
      taskIdMap[task.id] = newTasks[0].id;
    }

    for (const task of origTasks) {
      if (task.parent_id && taskIdMap[task.parent_id]) {
        await query('UPDATE project_tasks SET parent_id = $1 WHERE id = $2', [taskIdMap[task.parent_id], taskIdMap[task.id]]);
      }
    }

    const { rows: origMilestones } = await query(
      'SELECT * FROM project_milestones WHERE project_id = $1 AND company_id = $2',
      [params.projectId, companyId]
    );
    for (const ms of origMilestones) {
      await query(
        `INSERT INTO project_milestones (company_id, project_id, name, description, due_date, status, sort_order)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
        [companyId, newProject.id, ms.name, ms.description, adjustDate(ms.due_date), ms.sort_order]
      );
    }

    if (copy_phases) {
      const { rows: origPhases } = await query(
        'SELECT * FROM project_phases WHERE project_id = $1 AND company_id = $2',
        [params.projectId, companyId]
      );
      for (const phase of origPhases) {
        await query(
          `INSERT INTO project_phases (company_id, project_id, name, description, budget, start_date, end_date, sort_order, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
          [companyId, newProject.id, phase.name, phase.description, phase.budget,
           adjustDate(phase.start_date), adjustDate(phase.end_date), phase.sort_order]
        );
      }
    }

    if (copy_members) {
      const { rows: origMembers } = await query(
        'SELECT * FROM project_members WHERE project_id = $1 AND company_id = $2',
        [params.projectId, companyId]
      );
      for (const m of origMembers) {
        await query(
          'INSERT INTO project_members (company_id, project_id, user_id, role) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [companyId, newProject.id, m.user_id, m.role]
        );
      }
    }

    if (copy_allocations) {
      const { rows: origAlloc } = await query(
        'SELECT * FROM project_resource_allocations WHERE project_id = $1 AND company_id = $2',
        [params.projectId, companyId]
      );
      for (const a of origAlloc) {
        await query(
          `INSERT INTO project_resource_allocations (company_id, project_id, employee_id, allocation_percent, start_date, end_date, role_in_project, hourly_rate)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
          [companyId, newProject.id, a.employee_id, a.allocation_percent,
           adjustDate(a.start_date), adjustDate(a.end_date), a.role_in_project, a.hourly_rate]
        );
      }
    }

    if (copy_automation) {
      const { rows: origRules } = await query(
        'SELECT * FROM project_automation_rules WHERE project_id = $1 AND company_id = $2',
        [params.projectId, companyId]
      );
      for (const r of origRules) {
        await query(
          `INSERT INTO project_automation_rules (company_id, project_id, name, trigger_type, trigger_value, action_type, action_config, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, false)`,
          [companyId, newProject.id, r.name, r.trigger_type, r.trigger_value, r.action_type,
           typeof r.action_config === 'string' ? r.action_config : JSON.stringify(r.action_config)]
        );
      }
    }

    try {
      await query(
        `INSERT INTO project_activity_log (company_id, project_id, actor_name, action, entity_type, entity_id, entity_name, metadata)
         VALUES ($1, $2, 'Sistema', 'cloned', 'project', $3, $4, $5)`,
        [companyId, newProject.id, newProject.id, newProject.name,
         JSON.stringify({ from_project_id: orig.id, from_project_name: orig.name, tasks: origTasks.length, milestones: origMilestones.length })]
      );
    } catch {}

    return successResponse({
      project: newProject,
      tasks_cloned: origTasks.length,
      milestones_cloned: origMilestones.length,
    }, 201);
  } catch (err: any) {
    if (err?.code === '23505') return errorResponse('Project code already exists', 400);
    return errorResponse('Internal server error', 500);
  }
}
