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

    const { rows: sessions } = await query(
      `SELECT id, account_id, period FROM reconciliation_sessions
       WHERE id = $1 AND company_id = $2`,
      [params.sessionId, companyId]
    );

    if (!sessions[0]) return errorResponse('Session not found', 404);

    const session = sessions[0];

    const { rows: unmatchedLines } = await query(
      `SELECT * FROM reconciliation_statement_lines
       WHERE session_id = $1 AND company_id = $2 AND is_matched = false`,
      [params.sessionId, companyId]
    );

    if (unmatchedLines.length === 0) {
      return successResponse({ matches: [], variance: 0, matched_count: 0 });
    }

    const [year, month] = session.period.split('-');
    const periodStart = `${year}-${month}-01`;
    const periodEnd = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

    const { rows: journalEntries } = await query(
      `SELECT jel.id as line_id, jel.account_id, jel.debit, jel.credit, jel.description,
              je.id as entry_id, je.entry_date, je.entry_number
       FROM journal_entry_lines jel
       JOIN journal_entries je ON jel.entry_id = je.id
       WHERE je.company_id = $1
         AND je.status = 'posted'
         AND je.entry_date >= $2
         AND je.entry_date <= $3
         AND jel.account_id = $4
       ORDER BY je.entry_date, ABS(jel.debit - jel.credit)`,
      [companyId, periodStart, periodEnd, session.account_id]
    );

    const result = await transaction(async (client) => {
      const matches: any[] = [];
      const usedEntryLines = new Set<string>();

      for (const line of unmatchedLines) {
        const lineAmount = Math.abs(Number(line.amount));
        let bestMatch: any = null;
        let bestDiff = Infinity;

        for (const entry of journalEntries) {
          if (usedEntryLines.has(entry.line_id)) continue;

          const entryAmount = Math.abs(Number(entry.debit) - Number(entry.credit));
          const diff = Math.abs(lineAmount - entryAmount);

          if (diff < bestDiff && diff <= lineAmount * 0.02) {
            bestDiff = diff;
            bestMatch = entry;
          }
        }

        if (bestMatch) {
          usedEntryLines.add(bestMatch.line_id);
          const entryAmount = Math.abs(Number(bestMatch.debit) - Number(bestMatch.credit));
          const difference = lineAmount - entryAmount;

          const { rows: matchRows } = await client.query(
            `INSERT INTO reconciliation_matches
               (company_id, session_id, statement_line_id, journal_entry_id, amount, difference, status, notes)
             VALUES ($1, $2, $3, $4, $5, $6, 'confirmed', 'Auto-matched by system')
             RETURNING *`,
            [companyId, params.sessionId, line.id, bestMatch.entry_id, lineAmount, difference]
          );

          await client.query(
            `UPDATE reconciliation_statement_lines SET is_matched = true WHERE id = $1 AND company_id = $2`,
            [line.id, companyId]
          );

          matches.push(matchRows[0]);
        }
      }

      const totalMatched = matches.length;
      const totalVariance = matches.reduce((sum: number, m: any) => sum + Number(m.difference), 0);

      await client.query(
        `UPDATE reconciliation_sessions
         SET matched_count = matched_count + $1, variance = variance + $2, status = 'in_progress'
         WHERE id = $3 AND company_id = $4`,
        [totalMatched, totalVariance, params.sessionId, companyId]
      );

      return { matches, variance: totalVariance, matched_count: totalMatched };
    });

    return successResponse(result);
  } catch {
    return errorResponse('Auto-match failed', 500);
  }
}
