import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { generarClave } from '@/lib/generar-clave';
import { CredencialApoderado } from '@/lib/credenciales-csv';

/**
 * POST /api/educacion/apoderados/generar-claves
 *
 * Genera claves de acceso al portal para los apoderados de la empresa
 * autenticada. Body: `{ modo: 'faltantes' | 'todas' }`
 *
 * - `faltantes` (defecto): solo apoderados sin clave — los que aún no
 *   pueden ingresar.
 * - `todas`: resetea también las claves existentes (invalida las anteriores).
 *
 * El servidor solo guarda el hash; las claves en claro se devuelven una
 * única vez para que el cliente arme y descargue el CSV de reparto.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: { modo?: string } = await request.json().catch(() => ({}));
    const modo: 'faltantes' | 'todas' = body.modo === 'todas' ? 'todas' : 'faltantes';

    const db = await getDb();

    const result = await db.query(
      `SELECT id, nombres, apellido_paterno, apellido_materno, rut, email
       FROM educacion_apoderados
       WHERE company_id = $1
         ${modo === 'faltantes' ? 'AND (password IS NULL OR password = \'\')' : ''}
       ORDER BY apellido_paterno, nombres`,
      [user.company_id]
    );

    const filas = result.rows;
    if (filas.length === 0) {
      return NextResponse.json({ generadas: 0, credenciales: [] });
    }

    // Hashear primero y actualizar en una sola sentencia: si algo falla a
    // mitad de camino, no quedan claves viejas ya invalidadas a medias.
    const ids: string[] = [];
    const hashes: string[] = [];
    const credenciales: CredencialApoderado[] = [];

    for (const fila of filas) {
      const clave = generarClave();
      ids.push(fila.id);
      hashes.push(await bcrypt.hash(clave, 10));
      credenciales.push({
        nombres: fila.nombres,
        apellido_paterno: fila.apellido_paterno,
        apellido_materno: fila.apellido_materno,
        rut: fila.rut,
        email: fila.email,
        clave,
      });
    }

    await db.query(
      `UPDATE educacion_apoderados a
       SET password = v.hash
       FROM (SELECT unnest($2::uuid[]) AS id, unnest($3::text[]) AS hash) v
       WHERE a.id = v.id AND a.company_id = $1`,
      [user.company_id, ids, hashes]
    );

    return NextResponse.json({ generadas: filas.length, credenciales });
  } catch (error) {
    console.error('Error generando claves de apoderados:', error);
    return NextResponse.json({ error: 'Error al generar las claves' }, { status: 500 });
  }
}
