import { query } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; sessionId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT rs.*,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', rm.id,
            'statementLineId', rm.statement_line_id,
            'entryId', rm.journal_entry_id,
            'matchAmountCLP', rm.amount,
            'differenceCLP', rm.difference,
            'matchedAt', rm.created_at,
            'matchedBy', 'System',
            'matchType', CASE WHEN rm.difference = 0 THEN 'full' ELSE 'partial' END
          )) FROM reconciliation_matches rm
          WHERE rm.session_id = rs.id),
        '[]'::json) as matches,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', rsl.id,
            'accountId', rsl.account_id,
            'statementDate', rsl.statement_date,
            'transactionDate', rsl.statement_date,
            'description', rsl.description,
            'amountCLP', rsl.amount,
            'type', CASE WHEN rsl.amount >= 0 THEN 'credit' ELSE 'debit' END,
            'referenceNumber', rsl.reference,
            'source', 'manual',
            'matchStatus', CASE WHEN rsl.is_matched THEN 'matched' ELSE 'unmatched' END,
            'matchedEntryId', rm.journal_entry_id,
            'matchedAmountCLP', rm.amount,
            'differenceCLP', rm.difference,
            'notes', rm.notes,
            'createdAt', rsl.created_at
          )) FROM reconciliation_statement_lines rsl
          LEFT JOIN reconciliation_matches rm ON rm.statement_line_id = rsl.id AND rm.status = 'confirmed'
          WHERE rsl.session_id = rs.id),
        '[]'::json) as lines
       FROM reconciliation_sessions rs
       WHERE rs.id = $1 AND rs.company_id = $2`,
      [params.sessionId, companyId]
    );

    if (!rows[0]) return errorResponse('Session not found', 404);

    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to fetch session', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; sessionId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { status } = body;

    if (!status) return errorResponse('status is required', 400);

    const allowedStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return errorResponse(`status must be one of: ${allowedStatuses.join(', ')}`, 400);
    }

    const updateFields: string[] = ['status = $1'];
    const updateParams: any[] = [status];
    let paramIndex = 2;

    if (status === 'completed') {
      updateFields.push(`completed_at = NOW()`);
    }

    const { rows } = await query(
      `UPDATE reconciliation_sessions SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
       RETURNING *`,
      [...updateParams, params.sessionId, companyId]
    );

    if (!rows[0]) return errorResponse('Session not found', 404);

    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to update session', 500);
  }
}
