import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; resultId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      'SELECT * FROM veterinary_lab_results WHERE id = $1 AND company_id = $2',
      [params.resultId, companyId]
    );

    if (!rows[0]) return errorResponse('Lab result not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch lab result', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; resultId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { order_id, test_id, test_name, value, unit, reference_range, flag, note } = body;

    if (flag) {
      const validFlags = ['bajo', 'normal', 'alto', 'critico'];
      if (!validFlags.includes(flag)) return errorResponse('Invalid flag', 400);
    }

    const { rows } = await query(
      `UPDATE veterinary_lab_results SET
        order_id = COALESCE($1, order_id), test_id = $2,
        test_name = COALESCE($3, test_name), value = $4,
        unit = $5, reference_range = $6, flag = $7, note = $8
       WHERE id = $9 AND company_id = $10
       RETURNING *`,
      [order_id || null, test_id !== undefined ? test_id : null,
       test_name || null, value !== undefined ? value : null,
       unit !== undefined ? unit : null, reference_range !== undefined ? reference_range : null,
       flag || null, note !== undefined ? note : null,
       params.resultId, companyId]
    );

    if (!rows[0]) return errorResponse('Lab result not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update lab result', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; resultId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: existing } = await query(
      `SELECT id FROM veterinary_lab_results WHERE id = $1 AND company_id = $2`,
      [params.resultId, companyId]
    );

    if (!existing[0]) return errorResponse('Lab result not found', 404);

    await query(
      `DELETE FROM veterinary_lab_results WHERE id = $1 AND company_id = $2`,
      [params.resultId, companyId]
    );

    return successResponse({ message: 'Lab result deleted successfully' });
  } catch {
    return errorResponse('Failed to delete lab result', 500);
  }
}
