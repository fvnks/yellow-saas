import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string; taskId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { tag_ids } = body;

    if (!Array.isArray(tag_ids)) return errorResponse('tag_ids array required', 400);

    await query('DELETE FROM project_task_tags WHERE task_id = $1', [params.taskId]);

    for (const tagId of tag_ids) {
      await query(
        'INSERT INTO project_task_tags (task_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [params.taskId, tagId]
      );
    }

    const result = await query(
      `SELECT pt.*, t.name, t.color
       FROM project_task_tags pt
       JOIN project_tags t ON t.id = pt.tag_id
       WHERE pt.task_id = $1`,
      [params.taskId]
    );

    return successResponse(result.rows);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
