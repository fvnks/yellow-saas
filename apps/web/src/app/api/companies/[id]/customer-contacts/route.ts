import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');

    let result;
    if (customerId) {
      result = await query(
        'SELECT * FROM customer_contacts WHERE company_id = $1 AND customer_id = $2 ORDER BY is_primary DESC, name ASC',
        [companyId, customerId]
      );
    } else {
      result = await query(
        'SELECT * FROM customer_contacts WHERE company_id = $1 ORDER BY is_primary DESC, name ASC',
        [companyId]
      );
    }

    return successResponse(result.rows);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { customer_id, name, role, email, phone, mobile, is_primary, notes } = body;

    if (!customer_id || !name) {
      return errorResponse('Customer ID and name are required', 400);
    }

    const customerCheck = await query(
      'SELECT id FROM customers WHERE id = $1 AND company_id = $2',
      [customer_id, companyId]
    );

    if (customerCheck.rows.length === 0) {
      return errorResponse('Customer not found', 404);
    }

    if (is_primary) {
      await query(
        'UPDATE customer_contacts SET is_primary = false WHERE customer_id = $1 AND company_id = $2',
        [customer_id, companyId]
      );
    }

    const result = await query(
      `INSERT INTO customer_contacts (
        company_id, customer_id, name, role, email, phone, mobile, is_primary, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [companyId, customer_id, name, role || null, email || null, phone || null,
       mobile || null, is_primary || false, notes || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
