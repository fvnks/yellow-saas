import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; professionalId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT * FROM veterinary_professionals WHERE id = $1 AND company_id = $2`,
      [params.professionalId, companyId]
    );

    if (rows.length === 0) return errorResponse('Professional not found', 404);
    return successResponse(rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; professionalId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { user_id, full_name, rut, professional_license, specialty, phone, email, role, status } = body;

    if (role && !['veterinario', 'tecnico', 'asistente', 'cirujano', 'recepcion'].includes(role)) {
      return errorResponse('Role must be veterinario, tecnico, asistente, cirujano, or recepcion', 400);
    }

    if (rut) {
      const existing = await query(
        `SELECT id FROM veterinary_professionals WHERE company_id = $1 AND LOWER(rut) = LOWER($2) AND id != $3`,
        [companyId, rut, params.professionalId]
      );
      if (existing.rows.length > 0) {
        return errorResponse('A professional with this RUT already exists', 409);
      }
    }

    const { rows } = await query(
      `UPDATE veterinary_professionals SET
        user_id = COALESCE($1, user_id),
        full_name = COALESCE($2, full_name),
        rut = COALESCE($3, rut),
        professional_license = COALESCE($4, professional_license),
        specialty = COALESCE($5, specialty),
        phone = COALESCE($6, phone),
        email = COALESCE($7, email),
        role = COALESCE($8, role),
        status = COALESCE($9, status)
       WHERE id = $10 AND company_id = $11
       RETURNING *`,
      [
        user_id ?? null, full_name || null, rut || null, professional_license || null,
        specialty || null, phone || null, email || null, role || null, status || null,
        params.professionalId, companyId
      ]
    );

    if (rows.length === 0) return errorResponse('Professional not found', 404);
    return successResponse(rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; professionalId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `DELETE FROM veterinary_professionals WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.professionalId, companyId]
    );

    if (rows.length === 0) return errorResponse('Professional not found', 404);
    return successResponse({ message: 'Professional deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
