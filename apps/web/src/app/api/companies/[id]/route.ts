import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT id, name, slug, logo_url, tax_id, razon_social, giro, address, city, region, phone, email, settings, plan, status
       FROM companies WHERE id = $1`,
      [companyId]
    );

    if (rows.length === 0) return errorResponse('Company not found', 404);
    return successResponse(rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, tax_id, razon_social, giro, address, city, region, phone, email, logo_url } = body;

    const { rows } = await query(
      `UPDATE companies SET
        name = COALESCE($2, name),
        tax_id = COALESCE($3, tax_id),
        razon_social = COALESCE($4, razon_social),
        giro = COALESCE($5, giro),
        address = COALESCE($6, address),
        city = COALESCE($7, city),
        region = COALESCE($8, region),
        phone = COALESCE($9, phone),
        email = COALESCE($10, email),
        logo_url = COALESCE($11, logo_url),
        updated_at = now()
       WHERE id = $1
       RETURNING id, name, slug, logo_url, tax_id, razon_social, giro, address, city, region, phone, email`,
      [companyId, name, tax_id, razon_social, giro, address, city, region, phone, email, logo_url]
    );

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
