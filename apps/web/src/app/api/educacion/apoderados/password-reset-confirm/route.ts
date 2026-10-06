import { NextRequest, NextResponse } from 'next/server';
import { verificaEmpresa } from '@/lib/auth';
import { verificarTokenReset, validarPassword, actualizarClaveApoderado } from '@/lib/educacion/password-reset';
import { getDb } from '@/lib/db';

/**
 * POST /api/educacion/apoderados/password-reset-confirm?token=...
 *
 * Body opcional: { password: string }
 *
 * Si se provee contraseña: la valida, la hashea y la guarda en la BD.
 * Si no se provee: retorna el formulario/URL para que el front la complete.
 *
 * Flujo:
 * 1. Verifica el token JWT (purpose=password_reset, target_type=apoderado)
 * 2. Si el token es válido, busca el apoderado y verifica company_id
 * 3. Si se provee nueva contraseña: la valida y la guarda
 * 4. Si no se provee: retorna mensaje que el link es válido y hay que completar
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const user = await verificaEmpresa(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { token } = await params;
    const payload = await verificarTokenReset(token);

    if (!payload || payload.purpose !== 'password_reset') {
      return NextResponse.json({ error: 'Enlace inválido o expirado' }, { status: 400 });
    }

    const apoderadoId = payload.target_id as string;
    if (!apoderadoId) {
      return NextResponse.json({ error: 'Enlace inválido' }, { status: 400 });
    }

    // Verificar que el apoderado pertenece a la empresa del usuario autenticado
    const db = await getDb();
    const apoderado = await db.query(
      `SELECT id, email, nombres, apellido_paterno FROM educacion_apoderados WHERE id = $1 AND company_id = $2`,
      [apoderadoId, user.company_id]
    );

    if (apoderado.rows.length === 0) {
      return NextResponse.json({ error: 'Cuenta no encontrada o no pertenece a su empresa' }, { status: 404 });
    }

    // Intentar parsear body para nueva contraseña
    const body = await request.json();
    let password: string | undefined;

    if (body && body.password) {
      password = body.password as string;
      const { valido, error } = validarPassword(password);
      if (!valido) {
        return NextResponse.json({ error }, { status: 400 });
      }
    }

    // Si se provee contraseña, actualizarla
    if (password) {
      const actualizado = await actualizarClaveApoderado(db, apoderadoId, password);
      if (!actualizado) {
        return NextResponse.json({ error: 'Error al actualizar la clave' }, { status: 500 });
      }
      return NextResponse.json({
        mensaje: 'Contraseña actualizada correctamente. Ya puede ingresar al portal con la nueva clave.',
      });
    }

    // Si no hay contraseña: el link es válido, el cliente debe enviar el formulario
    return NextResponse.json({
      mensaje: 'Enlace válido. Envíe la nueva contraseña para completado el reset.',
      apoderadoId,
      email: apoderado.rows[0].email,
    });
  } catch (error) {
    console.error('Error en reset de clave de apoderado:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}