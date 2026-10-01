import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGE = 5000;
const MAX_SENT_PER_MINUTE = 5;

// La imagen Docker es standalone (no incluye packages/db/supabase/migrations),
// así que si la migración 109 no corrió en el VPS, la tabla se crea en el primer uso.
const CREATE_TABLE_SQL = `
 CREATE TABLE IF NOT EXISTS contact_messages (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 name TEXT NOT NULL,
 email TEXT NOT NULL,
 message TEXT NOT NULL,
 subject TEXT,
 company TEXT,
 source TEXT NOT NULL DEFAULT 'landing' CHECK (source IN ('landing', 'contact')),
 ip INET,
 user_agent TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
 );
 CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages (created_at DESC);
`;

const INSERT_SQL = `
 INSERT INTO contact_messages (name, email, message, subject, company, source, ip, user_agent)
 VALUES ($1, $2, $3, $4, $5, $6, $7::inet, $8)
`;

// Rate limit simple en memoria (por instancia): 5 mensajes por IP por minuto.
const hits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (list.length >= MAX_SENT_PER_MINUTE) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return errorResponse('Cuerpo de la solicitud inválido', 400);
    }

    // Honeypot: los bots rellenan el campo oculto. Respondemos éxito sin guardar.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return successResponse({ message: 'Mensaje recibido.' });
    }

    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const message = String(body.message ?? '').trim();
    const subject = typeof body.subject === 'string' && body.subject.trim() ? body.subject.trim().slice(0, 200) : null;
    const company = typeof body.company === 'string' && body.company.trim() ? body.company.trim().slice(0, 160) : null;
    const source = body.source === 'contact' ? 'contact' : 'landing';

    if (name.length < 2 || name.length > 120) {
      return errorResponse('Ingresa tu nombre (mínimo 2 caracteres).', 400);
    }
    if (email.length > 254 || !EMAIL_RE.test(email)) {
      return errorResponse('Ingresa un correo electrónico válido.', 400);
    }
    if (message.length < 10) {
      return errorResponse('El mensaje debe tener al menos 10 caracteres.', 400);
    }
    if (message.length > MAX_MESSAGE) {
      return errorResponse(`El mensaje no puede superar los ${MAX_MESSAGE} caracteres.`, 400);
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return errorResponse('Recibimos varios mensajes seguidos. Inténtalo de nuevo en un minuto.', 429);
    }

    const userAgent = (request.headers.get('user-agent') || '').slice(0, 300) || null;
    const params = [name, email, message, subject, company, source, ip === 'unknown' ? null : ip, userAgent];

    try {
      await query(INSERT_SQL, params);
    } catch (err: any) {
      // 42P01 = tabla inexistente: se crea y se reintenta una sola vez.
      if (err?.code === '42P01') {
        console.warn('contact_messages no existe, creándola...');
        await query(CREATE_TABLE_SQL);
        await query(INSERT_SQL, params);
      } else {
        throw err;
      }
    }

    return successResponse({ message: 'Mensaje recibido. Te responderemos dentro de 24 horas hábiles.' });
  } catch (err) {
    console.error('Contact error:', err);
    return errorResponse('No pudimos enviar tu mensaje. Escríbenos a hola@yellow-erp.cl', 500);
  }
}
