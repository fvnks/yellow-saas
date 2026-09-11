import { query } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; accountId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const period = url.searchParams.get('period');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    const queryParams: any[] = [companyId, params.accountId];
    let where = 'WHERE rsl.company_id = $1 AND rsl.account_id = $2';
    let paramIndex = 3;

    if (period) {
      const [year, month] = period.split('-');
      where += ` AND rsl.statement_date >= $${paramIndex} AND rsl.statement_date <= $${paramIndex + 1}`;
      queryParams.push(`${year}-${month}-01`);
      const lastDay = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
      queryParams.push(lastDay);
      paramIndex += 2;
    } else if (from) {
      where += ` AND rsl.statement_date >= $${paramIndex}`;
      queryParams.push(from);
      paramIndex++;
    }

    if (to) {
      where += ` AND rsl.statement_date <= $${paramIndex}`;
      queryParams.push(to);
      paramIndex++;
    }

    const { rows } = await query(
      `SELECT rsl.*,
        rm.journal_entry_id as matched_entry_id,
        rm.amount as matched_amount,
        rm.difference,
        rm.status as match_status
       FROM reconciliation_statement_lines rsl
       LEFT JOIN reconciliation_matches rm ON rm.statement_line_id = rsl.id AND rm.status = 'confirmed'
       ${where}
       ORDER BY rsl.statement_date DESC, rsl.created_at DESC`,
      queryParams
    );

    const result = rows.map((row: any) => ({
      id: row.id,
      accountId: row.account_id,
      statementDate: row.statement_date,
      transactionDate: row.statement_date,
      description: row.description,
      amountCLP: Number(row.amount),
      type: Number(row.amount) >= 0 ? 'credit' : 'debit',
      referenceNumber: row.reference,
      source: 'manual',
      matchStatus: row.is_matched ? 'matched' : 'unmatched',
      matchedEntryId: row.matched_entry_id || undefined,
      matchedAmountCLP: row.matched_amount ? Number(row.matched_amount) : undefined,
      differenceCLP: row.difference ? Number(row.difference) : undefined,
      createdAt: row.created_at,
    }));

    return successResponse(result);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
