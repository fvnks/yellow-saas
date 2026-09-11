import { query } from '@/api/lib/db';
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
      `SELECT id, status FROM reconciliation_sessions
       WHERE id = $1 AND company_id = $2`,
      [params.sessionId, companyId]
    );

    if (!sessions[0]) return errorResponse('Session not found', 404);

    if (sessions[0].status === 'completed') {
      return errorResponse('Session is already completed', 400);
    }

    if (sessions[0].status === 'cancelled') {
      return errorResponse('Cannot complete a cancelled session', 400);
    }

    const { rows } = await query(
      `UPDATE reconciliation_sessions
       SET status = 'completed', completed_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [params.sessionId, companyId]
    );

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to complete session', 500);
  }
}
