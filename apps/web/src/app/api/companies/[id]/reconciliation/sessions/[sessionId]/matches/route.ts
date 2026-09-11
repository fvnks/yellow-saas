import { query, transaction } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; sessionId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { statement_line_id, journal_entry_id } = body;

    if (!statement_line_id) return errorResponse('statement_line_id is required', 400);
    if (!journal_entry_id) return errorResponse('journal_entry_id is required', 400);

    const { rows: sessions } = await query(
      `SELECT id FROM reconciliation_sessions
       WHERE id = $1 AND company_id = $2 AND status IN ('open', 'in_progress')`,
      [params.sessionId, companyId]
    );

    if (!sessions[0]) return errorResponse('Session not found or not editable', 404);

    const { rows: lines } = await query(
      `SELECT id, amount FROM reconciliation_statement_lines
       WHERE id = $1 AND session_id = $2 AND company_id = $3`,
      [statement_line_id, params.sessionId, companyId]
    );

    if (!lines[0]) return errorResponse('Statement line not found', 404);

    const { rows: entries } = await query(
      `SELECT jel.id, jel.debit, jel.credit
       FROM journal_entry_lines jel
       JOIN journal_entries je ON jel.entry_id = je.id
       WHERE je.id = $1 AND je.company_id = $2`,
      [journal_entry_id, companyId]
    );

    if (!entries[0]) return errorResponse('Journal entry not found', 404);

    const lineAmount = Math.abs(Number(lines[0].amount));
    const entryAmount = Math.abs(Number(entries[0].debit) - Number(entries[0].credit));
    const difference = lineAmount - entryAmount;

    const result = await transaction(async (client) => {
      const { rows: matchRows } = await client.query(
        `INSERT INTO reconciliation_matches
           (company_id, session_id, statement_line_id, journal_entry_id, amount, difference, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, 'confirmed', 'Manual match')
         RETURNING *`,
        [companyId, params.sessionId, statement_line_id, journal_entry_id, lineAmount, difference]
      );

      await client.query(
        `UPDATE reconciliation_statement_lines SET is_matched = true WHERE id = $1 AND company_id = $2`,
        [statement_line_id, companyId]
      );

      await client.query(
        `UPDATE reconciliation_sessions
         SET matched_count = matched_count + 1, variance = variance + $1, status = 'in_progress'
         WHERE id = $2 AND company_id = $3`,
        [difference, params.sessionId, companyId]
      );

      return matchRows[0];
    });

    return successResponse(result, 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to create match', 500);
  }
}
