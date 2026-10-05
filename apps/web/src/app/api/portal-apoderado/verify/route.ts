import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPortalAuth } from '@/api/portal-apoderado/lib/auth';

/**
 * Devuelve la sesión del apoderado autenticado.
 *
 * Solo responde para tokens de tipo `apoderado`: un token de la app (firma
 * válida pero sin ese claim) recibe 401.
 */
export async function GET(request: NextRequest) {
  try {
    const sesion = await verifyPortalAuth(request);
    if (!sesion) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }

    const db = await getDb();

    const result = await db.query(
      `SELECT a.id, a.rut, a.nombres, a.apellido_paterno, a.apellido_materno,
              a.email, a.telefono, a.company_id,
              COALESCE((
                SELECT json_agg(json_build_object(
                         'id', e.id,
                         'nombres', e.nombres,
                         'apellido_paterno', e.apellido_paterno,
                         'apellido_materno', e.apellido_materno,
                         'rut', e.rut,
                         'curso_nombre', c.nombre
                       ) ORDER BY e.apellido_paterno)
                FROM educacion_estudiante_apoderado ea
                JOIN educacion_estudiantes e ON e.id = ea.estudiante_id
                LEFT JOIN educacion_cursos c ON e.curso_id = c.id
                WHERE ea.apoderado_id = a.id
              ), '[]'::json) AS pupilos
         FROM educacion_apoderados a
        WHERE a.id = $1`,
      [sesion.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Apoderado no encontrado' }, { status: 401 });
    }

    return NextResponse.json({
      data: {
        apoderado: result.rows[0],
      },
    });
  } catch (error) {
    console.error('Error en verificación:', error);
    return NextResponse.json(
      { error: 'Error al verificar token' },
      { status: 500 }
    );
  }
}
