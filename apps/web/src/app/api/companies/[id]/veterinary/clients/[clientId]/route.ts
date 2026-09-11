import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; clientId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT * FROM veterinary_clients WHERE id = $1 AND company_id = $2`,
      [params.clientId, companyId]
    );

    if (rows.length === 0) return errorResponse('Client not found', 404);
    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; clientId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const {
      customer_id, full_name, rut, phone, email, address, commune, city,
      secondary_contact_name, secondary_contact_phone, notes, status
    } = body;

    if (rut) {
      const existing = await query(
        `SELECT id FROM veterinary_clients WHERE company_id = $1 AND LOWER(rut) = LOWER($2) AND id != $3`,
        [companyId, rut, params.clientId]
      );
      if (existing.rows.length > 0) {
        return errorResponse('A client with this RUT already exists', 409);
      }
    }

    const { rows } = await query(
      `UPDATE veterinary_clients SET
        customer_id = COALESCE($1, customer_id),
        full_name = COALESCE($2, full_name),
        rut = COALESCE($3, rut),
        phone = COALESCE($4, phone),
        email = COALESCE($5, email),
        address = COALESCE($6, address),
        commune = COALESCE($7, commune),
        city = COALESCE($8, city),
        secondary_contact_name = COALESCE($9, secondary_contact_name),
        secondary_contact_phone = COALESCE($10, secondary_contact_phone),
        notes = COALESCE($11, notes),
        status = COALESCE($12, status),
        updated_at = NOW()
       WHERE id = $13 AND company_id = $14
       RETURNING *`,
      [
        customer_id ?? null, full_name || null, rut || null, phone || null, email || null,
        address || null, commune || null, city || null, secondary_contact_name || null,
        secondary_contact_phone || null, notes || null, status || null,
        params.clientId, companyId
      ]
    );

    if (rows.length === 0) return errorResponse('Client not found', 404);
    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; clientId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `DELETE FROM veterinary_clients WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.clientId, companyId]
    );

    if (rows.length === 0) return errorResponse('Client not found', 404);
    return successResponse({ message: 'Client deleted' });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
