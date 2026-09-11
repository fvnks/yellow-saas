import { query } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT rs.*,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', rsl.id,
            'statementLineId', rsl.id,
            'entryId', rm.journal_entry_id,
            'matchAmountCLP', rm.amount,
            'differenceCLP', rm.difference,
            'matchedAt', rm.created_at,
            'matchedBy', 'System',
            'matchType', CASE WHEN rm.difference = 0 THEN 'full' ELSE 'partial' END
          )) FROM reconciliation_matches rm
          JOIN reconciliation_statement_lines rsl ON rm.statement_line_id = rsl.id
          WHERE rm.session_id = rs.id AND rm.status = 'confirmed'),
        '[]'::json) as matches
       FROM reconciliation_sessions rs
       WHERE rs.company_id = $1
       ORDER BY rs.created_at DESC`,
      [companyId]
    );

    return successResponse(rows);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { account_id, period } = body;

    if (!account_id) return errorResponse('account_id is required', 400);
    if (!period) return errorResponse('period is required', 400);

    if (!/^\d{4}-\d{2}$/.test(period)) {
      return errorResponse('period must be in YYYY-MM format', 400);
    }

    const { rows: existing } = await query(
      `SELECT id FROM reconciliation_sessions
       WHERE company_id = $1 AND account_id = $2 AND period = $3 AND status NOT IN ('cancelled')`,
      [companyId, account_id, period]
    );

    if (existing.length > 0) {
      return errorResponse('A reconciliation session already exists for this account and period', 400);
    }

    const { rows } = await query(
      `INSERT INTO reconciliation_sessions (company_id, account_id, period, status)
       VALUES ($1, $2, $3, 'open')
       RETURNING *`,
      [companyId, account_id, period]
    );

    return successResponse(rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
