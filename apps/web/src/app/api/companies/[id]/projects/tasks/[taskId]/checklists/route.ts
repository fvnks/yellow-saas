import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      'SELECT * FROM project_task_checklists WHERE company_id = $1 AND task_id = $2 ORDER BY sort_order',
      [companyId, params.taskId]
    );
    return successResponse(rows);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { text, sort_order = 0 } = body;

    if (!text) return errorResponse('text is required', 400);

    const { rows } = await query(
      `INSERT INTO project_task_checklists (company_id, task_id, text, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [companyId, params.taskId, text, sort_order]
    );
    return successResponse(rows[0], 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
