import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { generarClave } from '@/lib/generar-clave';

/**
 * POST /api/educacion/apoderados/:id/password
 *
 * Genera (o resetea) la clave de un apoderado de la empresa autenticada.
 * Devuelve la clave en claro una sola vez: el servidor conserva solo el
 * hash, por lo que no se puede recuperar después.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();

    const existente = await db.query(
      'SELECT id FROM educacion_apoderados WHERE id = $1 AND company_id = $2',
      [id, user.company_id]
    );
    if (existente.rows.length === 0) {
      return NextResponse.json({ error: 'Apoderado no encontrado' }, { status: 404 });
    }

    const clave = generarClave();
    const hash = await bcrypt.hash(clave, 10);

    await db.query(
      'UPDATE educacion_apoderados SET password = $1 WHERE id = $2 AND company_id = $3',
      [hash, id, user.company_id]
    );

    return NextResponse.json({ data: { clave } });
  } catch (error) {
    console.error('Error generando clave de apoderado:', error);
    return NextResponse.json({ error: 'Error al generar la clave' }, { status: 500 });
  }
}
