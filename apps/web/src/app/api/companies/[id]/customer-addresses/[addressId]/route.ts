import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; addressId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'SELECT * FROM customer_addresses WHERE id = $1 AND company_id = $2',
      [params.addressId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Address not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to fetch address', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; addressId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    if (body.is_default) {
      await query(
        'UPDATE customer_addresses SET is_default = false WHERE customer_id = (SELECT customer_id FROM customer_addresses WHERE id = $1 AND company_id = $2) AND company_id = $2',
        [params.addressId, companyId]
      );
    }

    const result = await query(
      `UPDATE customer_addresses SET
        label = $1, address_type = $2, street = $3, number = $4, commune = $5,
        city = $6, region = $7, country = $8, postal_code = $9, is_default = $10,
        updated_at = NOW()
       WHERE id = $11 AND company_id = $12
       RETURNING *`,
      [body.label, body.address_type, body.street, body.number, body.commune,
       body.city, body.region, body.country, body.postal_code, body.is_default,
       params.addressId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Address not found', 404);

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Failed to update address', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; addressId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'DELETE FROM customer_addresses WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.addressId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Address not found', 404);

    return successResponse({ message: 'Address deleted successfully' });
  } catch {
    return errorResponse('Failed to delete address', 500);
  }
}
