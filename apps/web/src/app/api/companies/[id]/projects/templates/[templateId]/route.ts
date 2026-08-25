import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; templateId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'DELETE FROM project_templates WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.templateId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Template not found', 404);

    return successResponse({ message: 'Template deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
