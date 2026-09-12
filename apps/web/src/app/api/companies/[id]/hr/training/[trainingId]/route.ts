import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string; trainingId: string } }) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  const body = await request.json();
  const { title, description, trainer, start_date, end_date, max_participants, type, status } = body;

  try {
    const result = await query(
      `UPDATE hr_training SET title = $1, description = $2, trainer = $3, start_date = $4, end_date = $5, max_participants = $6, type = $7, status = $8, updated_at = now()
       WHERE id = $9 AND company_id = $10 RETURNING *`,
      [title, description || null, trainer || null, start_date, end_date || null, max_participants || 20, type || 'technical', status || 'scheduled', params.trainingId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Capacitación no encontrada', 404);
    return successResponse(result.rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; trainingId: string } }) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  try {
    await query('DELETE FROM hr_training WHERE id = $1 AND company_id = $2', [params.trainingId, companyId]);
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
