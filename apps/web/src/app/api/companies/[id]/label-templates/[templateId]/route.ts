import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; templateId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT * FROM label_templates WHERE id = $1 AND company_id = $2`,
      [params.templateId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Template not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Get label template error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; templateId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description, width_mm, height_mm, margin_mm, background_color, template_json, is_default, is_active } = body;

    if (is_default) {
      await query('UPDATE label_templates SET is_default = false WHERE company_id = $1', [companyId]);
    }

    const result = await query(
      `UPDATE label_templates SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        width_mm = COALESCE($3, width_mm),
        height_mm = COALESCE($4, height_mm),
        margin_mm = COALESCE($5, margin_mm),
        background_color = COALESCE($6, background_color),
        template_json = COALESCE($7, template_json),
        is_default = COALESCE($8, is_default),
        is_active = COALESCE($9, is_active),
        updated_at = NOW()
       WHERE id = $10 AND company_id = $11
       RETURNING *`,
      [name, description, width_mm, height_mm, margin_mm, background_color, template_json ? JSON.stringify(template_json) : null, is_default, is_active, params.templateId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Template not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Update label template error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; templateId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'DELETE FROM label_templates WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.templateId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Template not found', 404);

    return successResponse({ message: 'Template deleted successfully' });
  } catch (err) {
    console.error('Delete label template error:', err);
    return errorResponse('Internal server error', 500);
  }
}