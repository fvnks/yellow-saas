import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const body = await request.json();
  const { message } = body;

  if (!message) return errorResponse('Mensaje es requerido', 400);

  try {
    await query(
      'INSERT INTO ticket_messages (ticket_id, sender_type, sender_id, message) VALUES ($1, $2, $3, $4)',
      [params.id, 'super_admin', admin.id, message]
    );

    await query('UPDATE support_tickets SET updated_at = now() WHERE id = $1', [params.id]);

    return successResponse({ success: true });
  } catch (err) {
    console.error('Ticket message create error:', err);
    return errorResponse('Error al enviar mensaje', 500);
  }
}
