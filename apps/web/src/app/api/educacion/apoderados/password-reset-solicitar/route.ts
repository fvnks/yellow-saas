import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generarTokenReset, construirLinkReset, validarPassword, verificarTokenReset } from '@/lib/educacion/password-reset';
import { verificaEmpresa } from '@/lib/auth';

/**
 * POST /api/educacion/apoderados/password-reset-solicitar
 *
 * Body: { email: string }
 *
 * Genera un token JWT de 24h de vida útil, construye el link de reset y
 * RETORNA la URL lista para enviar por email. El envío real del email
 * debe hacerlo el controlador que llama a esta ruta (o un job background).
 *
 * Seguridad:
 * - Si el email no existe en educacion_apoderados de la empresa autenticada,
 *  respondemos 404 (no filtramos información sobre cuentas existentes).
 * - El token expira en 24h.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verificaEmpresa(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    const db = await getDb();

    // Buscar apoderado por email y company_id (normalizado: sin puntos/guiones)
    const result = await db.query(
      `SELECT id, rut, nombres, apellido_paterno, apellido_materno, email
       FROM educacion_apoderados
       WHERE email ILIKE $1 AND company_id = $2`,
      [`%${email}%`, user.company_id]
    );

    if (result.rows.length === 0) {
      // No confirmar si el usuario existe para evitar enumeración.
      // Retornamos éxito con link genérico para no filtrar.
      // En un futuro: integrar con servicio de email transaccional.
      return NextResponse.json({
        mensaje: 'Si la cuenta existe, se enviará un enlace de recuperación.',
      });
    }

    const apoderado = result.rows[0];
    const token = await generarTokenReset(apoderado.id);
    const baseUrl = request.nextUrl.origin;
    const linkReset = construirLinkReset(token, baseUrl);

    // TODO: Integrar aquí con el servicio de envío de emails del proyecto.
    // Ejemplo: await sendEmail({
    //   to: apoderado.email,
    //   subject: 'Recuperación de clave - Yellow ERP Educación',
    //   html: `<p>Hola ${apoderado.nombres} ${apoderado.apellido_paterno},</p>
    //           <p>Haz clic en el siguiente enlace para resetear tu clave:</p>
    //           <p><a href="${linkReset}">${linkReset}</a></p>
    //           <p>El enlace expirará en 24 horas.</p>`,
    // });

    return NextResponse.json({
      mensaje: 'Link de recuperación generado',
      link: linkReset,
    });
  } catch (error) {
    console.error('Error solicitando reset de clave:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}