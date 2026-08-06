import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';

const JWT_SECRET = getJwtSecret();

async function getUserFromRequest(request: NextRequest): Promise<{ id: string; company_id: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.company_id || !payload.id) return null;
    return { id: payload.id as string, company_id: payload.company_id as string };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('No autorizado', 401);
    if (user.company_id !== companyId) return errorResponse('Acceso denegado', 403);

    const counts = await query(
      `SELECT
        COUNT(*) FILTER (WHERE t.status IN ('open', 'in_progress')) as open,
        COUNT(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM ticket_messages tm
          WHERE tm.ticket_id = t.id AND tm.sender_type = 'super_admin'
          AND tm.created_at > COALESCE(t.company_last_read_at, t.created_at)
        )) as unread
       FROM support_tickets t
       WHERE t.company_id = $1`,
      [companyId]
    );

    const recent = await query(
      `SELECT t.id, t.subject, t.status,
        (SELECT MAX(tm.created_at) FROM ticket_messages tm
          WHERE tm.ticket_id = t.id AND tm.sender_type = 'super_admin'
          AND tm.created_at > COALESCE(t.company_last_read_at, t.created_at)) as last_reply_at
       FROM support_tickets t
       WHERE t.company_id = $1
       AND EXISTS (
         SELECT 1 FROM ticket_messages tm
         WHERE tm.ticket_id = t.id AND tm.sender_type = 'super_admin'
         AND tm.created_at > COALESCE(t.company_last_read_at, t.created_at)
       )
       ORDER BY last_reply_at DESC
       LIMIT 10`,
      [companyId]
    );

    return successResponse({
      ...counts.rows[0],
      recent: recent.rows,
    });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}