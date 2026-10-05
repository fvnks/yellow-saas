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

    // Obtener notas de todos los pupilos del apoderado
    const result = await db.query(
      `SELECT 
        cal.id,
        cal.nota,
        cal.tipo_evaluacion,
        cal.periodo,
        cal.anio_lectivo,
        cal.fecha_evaluacion,
        e.nombres as estudiante_nombres,
        e.apellido_paterno as estudiante_apellido,
        e.rut as estudiante_rut,
        a.nombre as asignatura_nombre,
        c.nombre as curso_nombre
       FROM educacion_calificaciones cal
       JOIN educacion_estudiantes e ON cal.estudiante_id = e.id
       JOIN educacion_curso_asignatura ca ON cal.curso_asignatura_id = ca.id
       JOIN educacion_asignaturas a ON ca.asignatura_id = a.id
       JOIN educacion_cursos c ON ca.curso_id = c.id
       JOIN educacion_estudiante_apoderado ea ON e.id = ea.estudiante_id
       WHERE ea.apoderado_id = $1
       ORDER BY e.apellido_paterno, a.nombre, cal.periodo`,
      [sesion.id]
    );

    // Agrupar por estudiante
    const notasPorEstudiante = result.rows.reduce((acc, row) => {
      const key = row.estudiante_rut;
      if (!acc[key]) {
        acc[key] = {
          estudiante: {
            nombres: row.estudiante_nombres,
            apellido_paterno: row.estudiante_apellido,
            rut: row.estudiante_rut,
            curso: row.curso_nombre,
          },
          notas: [],
        };
      }
      acc[key].notas.push({
        id: row.id,
        asignatura: row.asignatura_nombre,
        nota: row.nota,
        tipo_evaluacion: row.tipo_evaluacion,
        periodo: row.periodo,
        anio_lectivo: row.anio_lectivo,
        fecha_evaluacion: row.fecha_evaluacion,
      });
      return acc;
    }, {});

    return NextResponse.json({
      data: Object.values(notasPorEstudiante),
    });
  } catch (error) {
    console.error('Error fetching notas:', error);
    return NextResponse.json(
      { error: 'Error al obtener notas' },
      { status: 500 }
    );
  }
}
