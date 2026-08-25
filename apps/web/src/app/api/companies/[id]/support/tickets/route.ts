import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams } from '@/api/lib/helpers';
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

    const { page, limit, offset, search } = parseSearchParams(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const params: any[] = [companyId];
    let where = 'WHERE t.company_id = $1';
    let paramIndex = 2;

    if (status) {
      where += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      where += ` AND LOWER(t.subject) LIKE $${paramIndex}`;
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as count FROM support_tickets t ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT t.id, t.subject, t.status, t.priority, t.created_at, t.updated_at,
        p.full_name as created_by_name,
        sa.name as assigned_to_name,
        (SELECT COUNT(*) FROM ticket_messages tm WHERE tm.ticket_id = t.id) as message_count
       FROM support_tickets t
       LEFT JOIN profiles p ON p.id = t.created_by
       LEFT JOIN super_admins sa ON sa.id = t.assigned_to
       ${where}
       ORDER BY t.updated_at DESC
       OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      params
    );

    return successResponse({ tickets: rows, total, page, limit });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('No autorizado', 401);
    if (user.company_id !== companyId) return errorResponse('Acceso denegado', 403);

    const body = await request.json();
    const { subject, priority, message } = body;

    if (!subject?.trim()) return errorResponse('Asunto es requerido', 400);

    const { rows: ticketRows } = await query(
      `INSERT INTO support_tickets (company_id, subject, priority, created_by, status)
       VALUES ($1, $2, $3, $4, 'open')
       RETURNING *`,
      [companyId, subject.trim(), priority || 'medium', user.id]
    );

    const ticket = ticketRows[0];

    if (message?.trim()) {
      await query(
        `INSERT INTO ticket_messages (ticket_id, sender_type, sender_id, message)
         VALUES ($1, 'company', $2, $3)`,
        [ticket.id, user.id, message.trim()]
      );
    }

    return successResponse(ticket, 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
