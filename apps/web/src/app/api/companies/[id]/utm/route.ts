import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());

    const result = await query(
      `SELECT month, value, source, created_at 
       FROM utm_values 
       WHERE company_id = $1 AND year = $2
       ORDER BY month ASC`,
      [companyId, year]
    );

    return successResponse(result.rows);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { value, month, year, source = 'manual' } = body;

    if (!value || !month || !year) {
      return errorResponse('value, month, and year are required', 400);
    }

    const result = await query(
      `INSERT INTO utm_values (company_id, value, month, year, source)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (company_id, month, year) DO UPDATE SET value = EXCLUDED.value, source = EXCLUDED.source
       RETURNING *`,
      [companyId, value, month, year, source]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
