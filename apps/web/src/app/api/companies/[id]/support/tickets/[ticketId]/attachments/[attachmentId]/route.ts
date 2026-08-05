import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, errorResponse } from '@/api/lib/helpers';
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

export async function GET(request: NextRequest, { params }: { params: { id: string; ticketId: string; attachmentId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('No autorizado', 401);
    if (user.company_id !== companyId) return errorResponse('Acceso denegado', 403);

    const { rows } = await query(
      `SELECT a.name, a.mime_type, a.file_data, a.file_size
       FROM ticket_attachments a
       JOIN ticket_messages tm ON tm.id = a.message_id
       JOIN support_tickets t ON t.id = tm.ticket_id
       WHERE a.id = $1 AND a.company_id = $2 AND t.id = $3`,
      [params.attachmentId, companyId, params.ticketId]
    );

    if (rows.length === 0) return errorResponse('Archivo no encontrado', 404);

    const att = rows[0];
    const buffer = Buffer.from(att.file_data, 'base64');
    const isImage = (att.mime_type || '').startsWith('image/');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': att.mime_type || 'application/octet-stream',
        'Content-Disposition': `${isImage ? 'inline' : 'attachment'}; filename="${att.name}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Internal server error' } }, { status: 500 });
  }
}