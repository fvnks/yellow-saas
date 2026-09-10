import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT * FROM veterinary_services WHERE id = $1 AND company_id = $2`,
      [params.serviceId, companyId]
    );

    if (rows.length === 0) return errorResponse('Service not found', 404);
    return successResponse(rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description, category, price_clp, duration_minutes, requires_consent, status } = body;

    if (category && !['consulta', 'vacunacion', 'desparasitacion', 'cirugia', 'hospitalizacion', 'examen', 'imagenologia', 'peluqueria', 'otro'].includes(category)) {
      return errorResponse('Invalid category', 400);
    }

    const { rows } = await query(
      `UPDATE veterinary_services SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        price_clp = COALESCE($4, price_clp),
        duration_minutes = COALESCE($5, duration_minutes),
        requires_consent = COALESCE($6, requires_consent),
        status = COALESCE($7, status)
       WHERE id = $8 AND company_id = $9
       RETURNING *`,
      [
        name || null, description || null, category || null, price_clp ?? null,
        duration_minutes ?? null, requires_consent ?? null, status || null,
        params.serviceId, companyId
      ]
    );

    if (rows.length === 0) return errorResponse('Service not found', 404);
    return successResponse(rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `DELETE FROM veterinary_services WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.serviceId, companyId]
    );

    if (rows.length === 0) return errorResponse('Service not found', 404);
    return successResponse({ message: 'Service deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
