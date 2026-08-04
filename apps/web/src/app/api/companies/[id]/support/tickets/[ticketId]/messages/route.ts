import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'yellow-erp-secret-key-change-in-production');

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

export async function POST(request: NextRequest, { params }: { params: { id: string; ticketId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('No autorizado', 401);
    if (user.company_id !== companyId) return errorResponse('Acceso denegado', 403);

    const { rows } = await query(
      'SELECT id FROM support_tickets WHERE id = $1 AND company_id = $2',
      [params.ticketId, companyId]
    );
    if (rows.length === 0) return errorResponse('Ticket no encontrado', 404);

    const body = await request.json();
    const { message } = body;
    if (!message?.trim()) return errorResponse('Mensaje es requerido', 400);

    await query(
      `INSERT INTO ticket_messages (ticket_id, sender_type, sender_id, message)
       VALUES ($1, 'company', $2, $3)`,
      [params.ticketId, user.id, message.trim()]
    );

    await query('UPDATE support_tickets SET updated_at = now() WHERE id = $1', [params.ticketId]);

    return successResponse({ success: true }, 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
