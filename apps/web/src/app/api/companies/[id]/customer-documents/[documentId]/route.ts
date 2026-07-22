import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string; documentId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT cd.*, p.full_name as uploader_name
       FROM customer_documents cd
       LEFT JOIN profiles p ON p.id = cd.uploaded_by
       WHERE cd.id = $1 AND cd.company_id = $2`,
      [params.documentId, companyId]
    );

    if (rows.length === 0) return errorResponse('Document not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; documentId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description, file_url, file_data, mime_type, file_size, category } = body;

    const allowedCategories = ['contract', 'agreement', 'tax_id', 'invoice', 'certificate', 'other'];
    const docCategory = category && allowedCategories.includes(category) ? category : undefined;

    const { rows } = await query(
      `UPDATE customer_documents SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        file_url = COALESCE($3, file_url),
        file_data = COALESCE($4, file_data),
        mime_type = COALESCE($5, mime_type),
        file_size = COALESCE($6, file_size),
        category = COALESCE($7, category)
       WHERE id = $8 AND company_id = $9
       RETURNING *`,
      [name || null, description || null, file_url || null, file_data || null, mime_type || null, file_size || null, docCategory || null, params.documentId, companyId]
    );

    if (rows.length === 0) return errorResponse('Document not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; documentId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `DELETE FROM customer_documents WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.documentId, companyId]
    );

    if (rows.length === 0) return errorResponse('Document not found', 404);

    return successResponse({ deleted: true });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
