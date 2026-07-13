import { query } from '../../../lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    const params: any[] = [companyId];
    let where = 'WHERE je.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND (je.entry_number ILIKE $${paramIndex} OR je.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      where += ` AND je.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (from) {
      where += ` AND je.date >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      where += ` AND je.date <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as count FROM journal_entries je ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT je.*,
        (SELECT json_agg(json_build_object(
          'id', jel.id, 'account_id', jel.account_id, 'description', jel.description,
          'debit', jel.debit, 'credit', jel.credit, 'sort_order', jel.sort_order,
          'account', (SELECT json_build_object('id', a.id, 'code', a.code, 'name', a.name, 'type', a.type) FROM accounts a WHERE a.id = jel.account_id)
        )) FROM journal_entry_lines jel WHERE jel.entry_id = je.id) as lines
       FROM journal_entries je
       ${where}
       ORDER BY je.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(rows, total, page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { date, description, reference_type, reference_id, lines } = body;

    if (!date || !description || !lines?.length) {
      return errorResponse('Date, description, and lines are required', 400);
    }

    const totalDebit = lines.reduce(
      (sum: number, line: Record<string, unknown>) => sum + (Number(line.debit) || 0),
      0
    );
    const totalCredit = lines.reduce(
      (sum: number, line: Record<string, unknown>) => sum + (Number(line.credit) || 0),
      0
    );

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return errorResponse(
        `Journal entry must balance. Debit: ${totalDebit}, Credit: ${totalCredit}`,
        400
      );
    }

    if (totalDebit === 0 && totalCredit === 0) {
      return errorResponse('Debit and credit totals cannot both be zero', 400);
    }

    const { rows: countRows } = await query(
      `SELECT COUNT(*) as count FROM journal_entries WHERE company_id = $1`,
      [companyId]
    );
    const entryNumber = `CE-${String((parseInt(countRows[0]?.count || '0') + 1)).padStart(6, '0')}`;

    const { rows: entryRows } = await query(
      `INSERT INTO journal_entries (company_id, entry_number, date, description, reference_type, reference_id, total_debit, total_credit, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft')
       RETURNING *`,
      [
        companyId, entryNumber, date, description,
        reference_type || null, reference_id || null, totalDebit, totalCredit,
      ]
    );

    const entry = entryRows[0];

    const entryLines = lines.map((line: Record<string, unknown>, index: number) => ({
      entry_id: entry.id,
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

    return successResponse({ ...entry, lines: entryLines }, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
