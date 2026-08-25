import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'SELECT * FROM customer_segments WHERE company_id = $1 ORDER BY name ASC',
      [companyId]
    );

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

    const { name, description, min_orders, min_revenue } = body;

    if (!name) {
      return errorResponse('Name is required', 400);
    }

    const result = await query(
      `INSERT INTO customer_segments (company_id, name, description, min_orders, min_revenue)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [companyId, name, description || null, min_orders || 0, min_revenue || 0]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
