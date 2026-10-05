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
      [sesion.id]
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
      if (row.estado === 'justificado') acc[key].resumen.justificados++;
      
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
