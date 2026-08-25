import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';

const JWT_SECRET = getJwtSecret();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf', 'text/plain', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

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

    const contentType = request.headers.get('content-type') || '';
    let message = '';
    let files: File[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      message = (formData.get('message') as string) || '';
      for (let i = 0; i < MAX_FILES; i++) {
        const file = formData.get(`file${i}`);
        if (file && file instanceof File) files.push(file);
        else if (formData.get(`file${i}`)) {
          // fallback for non-File entries
        }
      }
    } else {
      const body = await request.json();
      message = body?.message || '';
    }

    if (!message.trim() && files.length === 0) {
      return errorResponse('Mensaje o archivo es requerido', 400);
    }

    const { rows } = await query(
      'SELECT id, status FROM support_tickets WHERE id = $1 AND company_id = $2',
      [params.ticketId, companyId]
    );
    if (rows.length === 0) return errorResponse('Ticket no encontrado', 404);
    if (rows[0].status === 'closed' || rows[0].status === 'resolved') {
      return errorResponse('No puedes enviar mensajes a un ticket resuelto o cerrado', 400);
    }

    if (files.length > 0) {
      if (files.length > MAX_FILES) return errorResponse(`Máximo ${MAX_FILES} archivos por mensaje`, 400);
      for (const f of files) {
        if (f.size > MAX_FILE_SIZE) return errorResponse(`Archivo "${f.name}" supera 10MB`, 400);
        if (f.type && !ALLOWED_TYPES.includes(f.type)) {
          return errorResponse(`Tipo de archivo no permitido: ${f.name}`, 400);
        }
      }
    }

    const messageResult = await query(
      `INSERT INTO ticket_messages (ticket_id, sender_type, sender_id, message)
       VALUES ($1, 'company', $2, $3)
       RETURNING id`,
      [params.ticketId, user.id, message.trim()]
    );
    const messageId = messageResult.rows[0].id;

    for (const f of files) {
      const buffer = Buffer.from(await f.arrayBuffer());
      await query(
        `INSERT INTO ticket_attachments (message_id, company_id, name, mime_type, file_size, file_data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [messageId, companyId, f.name, f.type || 'application/octet-stream', f.size, buffer.toString('base64')]
      );
    }

    await query('UPDATE support_tickets SET updated_at = now() WHERE id = $1', [params.ticketId]);

    return successResponse({ success: true }, 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}