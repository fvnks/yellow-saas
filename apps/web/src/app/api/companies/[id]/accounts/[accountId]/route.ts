import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; accountId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT a.*, COALESCE(je_bal.balance, 0) as balance
       FROM accounts a
       LEFT JOIN (
         SELECT account_id, COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0) as balance
         FROM journal_entry_lines GROUP BY account_id
       ) je_bal ON je_bal.account_id = a.id
       WHERE a.id = $1 AND a.company_id = $2`,
      [params.accountId, companyId]
    );

    if (rows.length === 0) return errorResponse('Account not found', 404);
    return successResponse(rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; accountId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, type, parent_id, is_active } = body;

    const { rows } = await query(`
      UPDATE accounts SET
        name = COALESCE($1, name), type = COALESCE($2, type),
        parent_id = $3, is_active = COALESCE($4, is_active)
      WHERE id = $5 AND company_id = $6
      RETURNING *
    `, [name, type, parent_id || null, is_active, params.accountId, companyId]);

    if (rows.length === 0) return errorResponse('Account not found', 404);
    return successResponse(rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; accountId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: usageCheck } = await query(
      'SELECT COUNT(*) FROM journal_entry_lines WHERE account_id = $1',
      [params.accountId]
    );

    if (parseInt(usageCheck[0].count) > 0) {
      return errorResponse('Cannot delete account with journal entries', 400);
    }

    const { rows } = await query(
      'DELETE FROM accounts WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.accountId, companyId]
    );

    if (rows.length === 0) return errorResponse('Account not found', 404);
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
