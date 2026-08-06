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

export async function GET(request: NextRequest, { params }: { params: { id: string; ticketId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('No autorizado', 401);
    if (user.company_id !== companyId) return errorResponse('Acceso denegado', 403);

    const { rows } = await query(
      'SELECT rating, comment, created_at FROM ticket_feedback WHERE ticket_id = $1 AND company_id = $2',
      [params.ticketId, companyId]
    );
    return successResponse(rows[0] || null);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string; ticketId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('No autorizado', 401);
    if (user.company_id !== companyId) return errorResponse('Acceso denegado', 403);

    const { rows } = await query(
      'SELECT id, status FROM support_tickets WHERE id = $1 AND company_id = $2',
      [params.ticketId, companyId]
    );
    if (rows.length === 0) return errorResponse('Ticket no encontrado', 404);
    if (!['resolved', 'closed'].includes(rows[0].status)) {
      return errorResponse('Solo puedes calificar un ticket resuelto o cerrado', 400);
    }

    const body = await request.json();
    const { rating, comment } = body;
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) return errorResponse('Calificación inválida (1-5)', 400);

    const existing = await query('SELECT id FROM ticket_feedback WHERE ticket_id = $1', [params.ticketId]);
    if (existing.rows.length > 0) return errorResponse('Este ticket ya fue calificado', 400);

    const inserted = await query(
      `INSERT INTO ticket_feedback (ticket_id, company_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING rating, comment, created_at`,
      [params.ticketId, companyId, r, comment?.trim() || null]
    );

    return successResponse(inserted.rows[0], 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}