import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { mergeSettings } from '@/lib/document-settings';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      'SELECT document_settings FROM companies WHERE id = $1',
      [companyId]
    );
    if (rows.length === 0) return errorResponse('Empresa no encontrada', 404);

    return successResponse(mergeSettings(rows[0].document_settings));
  } catch (err) {
    console.error('Get document settings error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    if (!body || Array.isArray(body)) return errorResponse('Cuerpo inválido', 400);

    const settings = mergeSettings(body);

    await query(
      'UPDATE companies SET document_settings = $1, updated_at = now() WHERE id = $2',
      [JSON.stringify(settings), companyId]
    );

    return successResponse(settings);
  } catch (err) {
    console.error('Update document settings error:', err);
    return errorResponse('Internal server error', 500);
  }
}