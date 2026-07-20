import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; leadId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT l.*, COALESCE(p.first_name || ' ' || p.last_name, 'Sin asignar') as assigned_name
       FROM leads l
       LEFT JOIN profiles p ON l.assigned_to = p.id
       WHERE l.id = $1 AND l.company_id = $2`,
      [params.leadId, companyId]
    );

    if (rows.length === 0) return errorResponse('Lead not found', 404);
    return successResponse(rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; leadId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, email, phone, source, status, assigned_to, estimated_value, notes } = body;

    const { rows } = await query(`
      UPDATE leads SET
        name = COALESCE($1, name), email = $2, phone = $3, source = $4,
        status = COALESCE($5, status), assigned_to = $6,
        estimated_value = $7, notes = $8
      WHERE id = $9 AND company_id = $10
      RETURNING *
    `, [name, email || null, phone || null, source || null, status, assigned_to || null, estimated_value || null, notes || null, params.leadId, companyId]);

    if (rows.length === 0) return errorResponse('Lead not found', 404);
    return successResponse(rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; leadId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      'DELETE FROM leads WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.leadId, companyId]
    );

    if (rows.length === 0) return errorResponse('Lead not found', 404);
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
