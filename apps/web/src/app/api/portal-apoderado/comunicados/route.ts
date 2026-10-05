import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPortalAuth } from '@/api/portal-apoderado/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Exige un token de apoderado (no uno de empresa) y devuelve su id.
    const sesion = await verifyPortalAuth(request);
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const db = await getDb();

    // Tokens antiguos no traían company_id: en ese caso se resuelve desde la
    // ficha del apoderado para no devolver comunicados de otra empresa.
    let companyId = typeof sesion.company_id === 'string' ? sesion.company_id : null;
    if (!companyId) {
      const fila = await db.query(
        'SELECT company_id FROM educacion_apoderados WHERE id = $1',
        [sesion.id]
      );
      companyId = fila.rows[0]?.company_id ?? null;
    }
    if (!companyId) {
      return NextResponse.json({ data: [] });
    }

    // Obtener comunicados generales y de los cursos de los pupilos
    const result = await db.query(
      `SELECT 
        com.id,
        com.titulo,
        com.contenido,
        com.tipo,
        com.fecha_publicacion,
        c.nombre as curso_nombre
       FROM educacion_comunicados com
       LEFT JOIN educacion_cursos c ON com.curso_id = c.id
       WHERE com.company_id = $1 
         AND com.activo = true
         AND (
           com.tipo = 'general'
           OR com.curso_id IN (
             SELECT DISTINCT e.curso_id
             FROM educacion_estudiantes e
             JOIN educacion_estudiante_apoderado ea ON e.id = ea.estudiante_id
             WHERE ea.apoderado_id = $2
           )
         )
       ORDER BY com.fecha_publicacion DESC`,
      [companyId, sesion.id]
    );

    return NextResponse.json({
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching comunicados:', error);
    return NextResponse.json(
      { error: 'Error al obtener comunicados' },
      { status: 500 }
    );
  }
}
