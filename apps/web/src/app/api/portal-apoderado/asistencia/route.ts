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

    // Obtener asistencia de todos los pupilos del apoderado
    const result = await db.query(
      `SELECT 
        asis.id,
        asis.fecha,
        asis.estado,
        asis.justificacion,
        e.nombres as estudiante_nombres,
        e.apellido_paterno as estudiante_apellido,
        e.rut as estudiante_rut,
        c.nombre as curso_nombre
       FROM educacion_asistencia asis
       JOIN educacion_estudiantes e ON asis.estudiante_id = e.id
       JOIN educacion_cursos c ON asis.curso_id = c.id
       JOIN educacion_estudiante_apoderado ea ON e.id = ea.estudiante_id
       WHERE ea.apoderado_id = $1
       ORDER BY e.apellido_paterno, asis.fecha DESC`,
      [payload.id]
    );

    // Agrupar por estudiante
    const asistenciaPorEstudiante = result.rows.reduce((acc, row) => {
      const key = row.estudiante_rut;
      if (!acc[key]) {
        acc[key] = {
          estudiante: {
            nombres: row.estudiante_nombres,
            apellido_paterno: row.estudiante_apellido,
            rut: row.estudiante_rut,
            curso: row.curso_nombre,
          },
          resumen: {
            presentes: 0,
            ausentes: 0,
            atrasos: 0,
            justificados: 0,
            total: 0,
          },
          asistencias: [],
        };
      }
      
      acc[key].asistencias.push({
        id: row.id,
        fecha: row.fecha,
        estado: row.estado,
        justificacion: row.justificacion,
      });
      
      // Actualizar resumen
      acc[key].resumen.total++;
      if (row.estado === 'presente') acc[key].resumen.presentes++;
      if (row.estado === 'ausente') acc[key].resumen.ausentes++;
      if (row.estado === 'atrasado') acc[key].resumen.atrasos++;
      if (row.estado === 'justificado') acc[key].resummary.justificados++;
      
      return acc;
    }, {});

    return NextResponse.json({
      data: Object.values(asistenciaPorEstudiante),
    });
  } catch (error) {
    console.error('Error fetching asistencia:', error);
    return NextResponse.json(
      { error: 'Error al obtener asistencia' },
      { status: 500 }
    );
  }
}
