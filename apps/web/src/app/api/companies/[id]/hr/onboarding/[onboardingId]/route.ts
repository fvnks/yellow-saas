import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string; onboardingId: string } }) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  const body = await request.json();
  const { start_date, mentor_name, notes, status, progress, tasks_total, tasks_completed } = body;

  try {
    const result = await query(
      `UPDATE hr_onboarding SET start_date = $1, mentor_name = $2, notes = $3, status = $4, progress = $5, tasks_total = $6, tasks_completed = $7, updated_at = now()
       WHERE id = $8 AND company_id = $9 RETURNING *`,
      [start_date, mentor_name || null, notes || null, status || 'in_progress', progress || 0, tasks_total || 10, tasks_completed || 0, params.onboardingId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Onboarding no encontrado', 404);
    return successResponse(result.rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; onboardingId: string } }) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  try {
    await query('DELETE FROM hr_onboarding WHERE id = $1 AND company_id = $2', [params.onboardingId, companyId]);
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
