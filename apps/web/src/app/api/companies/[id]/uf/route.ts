import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    if (type === 'history') {
      const days = parseInt(url.searchParams.get('days') || '30');
      const result = await query(
        `SELECT date, value, source FROM uf_values 
         WHERE company_id = $1 AND date >= CURRENT_DATE - $2::integer
         ORDER BY date DESC`,
        [companyId, days]
      );
      return successResponse(result.rows);
    }

    const result = await query(
      `SELECT value, date, source FROM uf_values 
       WHERE company_id = $1 
       ORDER BY date DESC LIMIT 1`,
      [companyId]
    );

    if (result.rows.length === 0) {
      return successResponse(null);
    }

    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { value, date, source = 'manual' } = body;

    if (!value || !date) {
      return errorResponse('value and date are required', 400);
    }

    const result = await query(
      `INSERT INTO uf_values (company_id, value, date, source)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (company_id, date) DO UPDATE SET value = EXCLUDED.value, source = EXCLUDED.source
       RETURNING *`,
      [companyId, value, date, source]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
