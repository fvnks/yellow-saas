import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  try {
    const result = await query(
      `SELECT * FROM hr_training WHERE company_id = $1 ORDER BY start_date DESC`,
      [companyId]
    );
    return successResponse(result.rows);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  const body = await request.json();
  const { title, description, trainer, start_date, end_date, max_participants, type, status } = body;

  if (!title || !start_date) return errorResponse('title y start_date son requeridos', 400);

  try {
    const result = await query(
      `INSERT INTO hr_training (company_id, title, description, trainer, start_date, end_date, max_participants, type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [companyId, title, description || null, trainer || null, start_date, end_date || null, max_participants || 20, type || 'technical', status || 'scheduled']
    );
    return successResponse(result.rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
