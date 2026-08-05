import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/api/lib/db';
import { errorResponse } from '@/api/lib/helpers';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string; attachmentId: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const { rows } = await query(
      `SELECT a.name, a.mime_type, a.file_data
       FROM ticket_attachments a
       JOIN ticket_messages tm ON tm.id = a.message_id
       JOIN support_tickets t ON t.id = tm.ticket_id
       WHERE a.id = $1 AND t.id = $2`,
      [params.attachmentId, params.id]
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