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
    const { name, code, start_date, end_date } = body;

    // Get original project
    const { rows: origProjects } = await query(
      'SELECT * FROM projects WHERE id = $1 AND company_id = $2',
      [params.projectId, companyId]
    );
    if (origProjects.length === 0) return errorResponse('Project not found', 404);
    const orig = origProjects[0];

    // Create cloned project
    const { rows: newProjects } = await query(
      `INSERT INTO projects (company_id, name, code, description, customer_id, start_date, end_date, budget, status, project_manager_id, cost_center_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'planning', $9, $10, $11) RETURNING *`,
      [
        companyId,
        name || `${orig.name} (Copia)`,
        code || `${orig.code}-COPY`,
        orig.description,
        orig.customer_id,
        start_date || null,
        end_date || null,
        orig.budget,
        orig.project_manager_id,
        orig.cost_center_id,
        orig.created_by,
      ]
    );
    const newProject = newProjects[0];

    // Clone tasks (without status/progress)
    const { rows: origTasks } = await query(
      'SELECT * FROM project_tasks WHERE project_id = $1 AND company_id = $2',
      [params.projectId, companyId]
    );

    const taskIdMap: Record<string, string> = {};
    for (const task of origTasks) {
      const { rows: newTasks } = await query(
        `INSERT INTO project_tasks (company_id, project_id, name, description, status, priority, estimated_hours, parent_id)
         VALUES ($1, $2, $3, $4, 'todo', $5, $6, $7) RETURNING *`,
        [companyId, newProject.id, task.name, task.description, task.priority, task.estimated_hours, null]
      );
      taskIdMap[task.id] = newTasks[0].id;
    }

    // Fix parent references for subtasks
    for (const task of origTasks) {
      if (task.parent_id && taskIdMap[task.parent_id]) {
        await query(
          'UPDATE project_tasks SET parent_id = $1 WHERE id = $2',
          [taskIdMap[task.parent_id], taskIdMap[task.id]]
        );
      }
    }

    // Clone milestones (reset status)
    const { rows: origMilestones } = await query(
      'SELECT * FROM project_milestones WHERE project_id = $1 AND company_id = $2',
      [params.projectId, companyId]
    );
    for (const ms of origMilestones) {
      await query(
        `INSERT INTO project_milestones (company_id, project_id, name, description, due_date, status, sort_order)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
        [companyId, newProject.id, ms.name, ms.description, ms.due_date, ms.sort_order]
      );
    }

    // Log activity
    try {
      await query(
        `INSERT INTO project_activity_log (company_id, project_id, actor_name, action, entity_type, entity_id, entity_name, metadata)
         VALUES ($1, $2, 'Sistema', 'cloned', 'project', $3, $4, $5)`,
        [companyId, newProject.id, newProject.id, newProject.name,
         JSON.stringify({ from_project_id: orig.id, from_project_name: orig.name, tasks_count: origTasks.length, milestones_count: origMilestones.length })]
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
