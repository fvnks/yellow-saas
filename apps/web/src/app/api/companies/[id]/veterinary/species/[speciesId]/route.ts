import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; speciesId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT * FROM veterinary_species WHERE id = $1 AND company_id = $2`,
      [params.speciesId, companyId]
    );

    if (rows.length === 0) return errorResponse('Species not found', 404);
    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; speciesId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { key, name, category, common_breeds, status } = body;

    if (key) {
      const existing = await query(
        `SELECT id FROM veterinary_species WHERE company_id = $1 AND LOWER(key) = LOWER($2) AND id != $3`,
        [companyId, key, params.speciesId]
      );
      if (existing.rows.length > 0) {
        return errorResponse('A species with this key already exists', 409);
      }
    }

    const { rows } = await query(
      `UPDATE veterinary_species SET
        key = COALESCE($1, key),
        name = COALESCE($2, name),
        category = COALESCE($3, category),
        common_breeds = COALESCE($4, common_breeds),
        status = COALESCE($5, status),
        updated_at = NOW()
       WHERE id = $6 AND company_id = $7
       RETURNING *`,
      [key || null, name || null, category || null, common_breeds || null, status || null, params.speciesId, companyId]
    );

    if (rows.length === 0) return errorResponse('Species not found', 404);
    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; speciesId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `DELETE FROM veterinary_species WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.speciesId, companyId]
    );

    if (rows.length === 0) return errorResponse('Species not found', 404);
    return successResponse({ message: 'Species deleted' });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
