import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPortalAuth } from '@/api/portal-apoderado/lib/auth';

/**
 * DELETE: quita un hijo de la cuenta del apoderado autenticado.
 *
 * Solo puede desvincular hijos propios (`apoderado_id = sesión.id`), por lo que
 * nunca alcanza el vínculo de otro apoderado.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ estudianteId: string }> }
) {
  try {
    const sesion = await verifyPortalAuth(request);
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { estudianteId } = await params;

    if (!estudianteId || !/^[0-9a-f-]{36}$/i.test(estudianteId)) {
      return NextResponse.json({ error: 'Identificador de estudiante inválido' }, { status: 400 });
    }

    const db = await getDb();
    const resultado = await db.query(
      `DELETE FROM educacion_estudiante_apoderado
        WHERE estudiante_id = $1 AND apoderado_id = $2
        RETURNING estudiante_id`,
      [estudianteId, sesion.id]
    );

    if (resultado.rows.length === 0) {
      return NextResponse.json(
        { error: 'Este hijo no está vinculado a tu cuenta' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Hijo eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando hijo:', error);
    return NextResponse.json({ error: 'Error al eliminar el hijo' }, { status: 500 });
  }
}
