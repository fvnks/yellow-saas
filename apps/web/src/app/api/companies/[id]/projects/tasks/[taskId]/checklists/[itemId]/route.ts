import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string; taskId: string; itemId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 3;

    for (const [key, value] of Object.entries(body)) {
      if (['text', 'is_checked', 'sort_order'].includes(key)) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) return errorResponse('No valid fields', 400);

    const { rows } = await query(
      `UPDATE project_task_checklists SET ${fields.join(', ')}
       WHERE id = $1 AND company_id = $2 AND task_id = $3
       RETURNING *`,
      [params.itemId, companyId, params.taskId, ...values]
    );

    if (rows.length === 0) return errorResponse('Item not found', 404);
    return successResponse(rows[0]);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; taskId: string; itemId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    await query(
      'DELETE FROM project_task_checklists WHERE id = $1 AND company_id = $2 AND task_id = $3',
      [params.itemId, companyId, params.taskId]
    );
    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
