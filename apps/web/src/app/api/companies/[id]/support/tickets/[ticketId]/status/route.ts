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

export async function PATCH(request: NextRequest, { params }: { params: { id: string; ticketId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('No autorizado', 401);
    if (user.company_id !== companyId) return errorResponse('Acceso denegado', 403);

    const body = await request.json();
    const { status } = body;
    if (!['open', 'resolved'].includes(status)) {
      return errorResponse('Estado no permitido. Solo puedes reabrirlo o marcarlo como resuelto.', 400);
    }

    const { rows } = await query(
      'SELECT id, status FROM support_tickets WHERE id = $1 AND company_id = $2',
      [params.ticketId, companyId]
    );
    if (rows.length === 0) return errorResponse('Ticket no encontrado', 404);

    if (status === 'open' && !['resolved', 'closed'].includes(rows[0].status)) {
      return errorResponse('El ticket ya está abierto', 400);
    }
    if (status === 'resolved' && rows[0].status === 'resolved') {
      return errorResponse('El ticket ya está resuelto', 400);
    }

    await query('UPDATE support_tickets SET status = $1, updated_at = now() WHERE id = $2', [status, params.ticketId]);

    await query(
      `INSERT INTO ticket_status_history (ticket_id, from_status, to_status, changed_by_id, changed_by_type)
       VALUES ($1, $2, $3, $4, 'company')`,
      [params.ticketId, rows[0].status, status, user.id]
    );

    return successResponse({ success: true, status });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}