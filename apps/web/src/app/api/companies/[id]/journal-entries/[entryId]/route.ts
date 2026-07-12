import { query } from '../../../../lib/db';
import { getCompanyId, successResponse, errorResponse } from '../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT je.*,
        (SELECT json_agg(json_build_object(
          'id', jel.id, 'account_id', jel.account_id, 'description', jel.description,
          'debit', jel.debit, 'credit', jel.credit, 'sort_order', jel.sort_order,
          'account', (SELECT json_build_object('id', a.id, 'code', a.code, 'name', a.name, 'type', a.type) FROM accounts a WHERE a.id = jel.account_id)
        )) FROM journal_entry_lines jel WHERE jel.entry_id = je.id) as lines
       FROM journal_entries je
       WHERE je.id = $1 AND je.company_id = $2`,
      [params.entryId, companyId]
    );

    if (!rows[0]) return errorResponse('Journal entry not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch journal entry', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const { rows } = await query(
      `UPDATE journal_entries SET
        date = $1, description = $2, reference_type = $3, reference_id = $4,
        status = $5, updated_at = NOW()
       WHERE id = $6 AND company_id = $7
       RETURNING *`,
      [
        body.date, body.description, body.reference_type, body.reference_id,
        body.status, params.entryId, companyId,
      ]
    );

    if (!rows[0]) return errorResponse('Journal entry not found', 404);

    if (body.lines) {
      await query(
        `DELETE FROM journal_entry_lines WHERE entry_id = $1 AND company_id = $2`,
        [params.entryId, companyId]
      );

      if (body.lines.length > 0) {
        const entryLines = body.lines.map((line: Record<string, unknown>, index: number) => ({
          entry_id: params.entryId,
          company_id: companyId,
          account_id: line.account_id,
          description: line.description || null,
          debit: Number(line.debit) || 0,
          credit: Number(line.credit) || 0,
          sort_order: index,
        }));

        for (const el of entryLines) {
          await query(
            `INSERT INTO journal_entry_lines (entry_id, company_id, account_id, description, debit, credit, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [el.entry_id, el.company_id, el.account_id, el.description, el.debit, el.credit, el.sort_order]
          );
        }

        const totalDebit = body.lines.reduce(
          (sum: number, line: Record<string, unknown>) => sum + (Number(line.debit) || 0),
          0
        );
        const totalCredit = body.lines.reduce(
          (sum: number, line: Record<string, unknown>) => sum + (Number(line.credit) || 0),
          0
        );

        await query(
          `UPDATE journal_entries SET total_debit = $1, total_credit = $2 WHERE id = $3 AND company_id = $4`,
          [totalDebit, totalCredit, params.entryId, companyId]
        );
      }
    }

    const { rows: updated } = await query(
      `SELECT je.*,
        (SELECT json_agg(json_build_object(
          'id', jel.id, 'account_id', jel.account_id, 'description', jel.description,
          'debit', jel.debit, 'credit', jel.credit, 'sort_order', jel.sort_order,
          'account', (SELECT json_build_object('id', a.id, 'code', a.code, 'name', a.name, 'type', a.type) FROM accounts a WHERE a.id = jel.account_id)
        )) FROM journal_entry_lines jel WHERE jel.entry_id = je.id) as lines
       FROM journal_entries je
       WHERE je.id = $1 AND je.company_id = $2`,
      [params.entryId, companyId]
    );

    return successResponse(updated[0]);
  } catch {
    return errorResponse('Failed to update journal entry', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: entry } = await query(
      `SELECT status FROM journal_entries WHERE id = $1 AND company_id = $2`,
      [params.entryId, companyId]
    );

    if (!entry[0]) return errorResponse('Journal entry not found', 404);

    if (entry[0].status === 'posted') {
      return errorResponse('Cannot delete posted journal entry', 400);
    }

    await query(`DELETE FROM journal_entry_lines WHERE entry_id = $1 AND company_id = $2`, [params.entryId, companyId]);
    await query(`DELETE FROM journal_entries WHERE id = $1 AND company_id = $2`, [params.entryId, companyId]);

    return successResponse({ message: 'Journal entry deleted successfully' });
  } catch {
    return errorResponse('Failed to delete journal entry', 500);
  }
}
