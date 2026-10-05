import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const db = await getDb();

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
      [payload.company_id, payload.id]
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
