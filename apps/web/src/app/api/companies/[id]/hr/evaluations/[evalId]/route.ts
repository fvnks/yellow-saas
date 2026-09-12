import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string; evalId: string } }) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  const body = await request.json();
  const { period, overall_score, competencies_score, goals_score, comments, status } = body;

  try {
    const result = await query(
      `UPDATE hr_evaluations SET period = $1, overall_score = $2, competencies_score = $3, goals_score = $4, comments = $5, status = $6, updated_at = now()
       WHERE id = $7 AND company_id = $8 RETURNING *`,
      [period, overall_score || 0, competencies_score || 0, goals_score || 0, comments || null, status || 'completed', params.evalId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Evaluación no encontrada', 404);
    return successResponse(result.rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; evalId: string } }) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  try {
    await query('DELETE FROM hr_evaluations WHERE id = $1 AND company_id = $2', [params.evalId, companyId]);
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
