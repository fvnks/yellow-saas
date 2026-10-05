import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/educacion/reportes/calificaciones - Reporte de calificaciones
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const curso_id = searchParams.get('curso_id');
    const asignatura_id = searchParams.get('asignatura_id');
    const periodo = searchParams.get('periodo');
    const anio_lectivo = searchParams.get('anio_lectivo') || '2026';
    const formato = searchParams.get('formato') || 'json';

    const db = await getDb();
    
    let query = `
      SELECT 
        e.rut as estudiante_rut,
        e.nombres || ' ' || e.apellido_paterno || ' ' || COALESCE(e.apellido_materno, '') as estudiante_nombre,
        c.nombre as curso_nombre,
        a.nombre as asignatura_nombre,
        cal.periodo,
        cal.anio_lectivo,
        ROUND(AVG(cal.nota), 2) as promedio,
        COUNT(cal.id) as total_evaluaciones,
        MIN(cal.nota) as nota_minima,
        MAX(cal.nota) as nota_maxima
      FROM educacion_calificaciones cal
      JOIN educacion_estudiantes e ON cal.estudiante_id = e.id
      JOIN educacion_curso_asignatura ca ON cal.curso_asignatura_id = ca.id
      JOIN educacion_asignaturas a ON ca.asignatura_id = a.id
      JOIN educacion_cursos c ON ca.curso_id = c.id
      WHERE cal.company_id = $1 AND cal.anio_lectivo = $2
    `;
    const params: any[] = [user.company_id, parseInt(anio_lectivo)];

    if (curso_id) {
      query += ` AND ca.curso_id = $${params.length + 1}`;
      params.push(curso_id);
    }

    if (asignatura_id) {
      query += ` AND ca.asignatura_id = $${params.length + 1}`;
      params.push(asignatura_id);
    }

    if (periodo) {
      query += ` AND cal.periodo = $${params.length + 1}`;
      params.push(parseInt(periodo));
    }

    query += ` GROUP BY e.id, e.rut, e.nombres, e.apellido_paterno, e.apellido_materno, c.nombre, a.nombre, cal.periodo, cal.anio_lectivo ORDER BY c.nombre, e.apellido_paterno, a.nombre`;

    const result = await db.query(query, params);

    // Si se solicita formato CSV
    if (formato === 'csv') {
      const headers = ['RUT', 'Estudiante', 'Curso', 'Asignatura', 'Período', 'Año', 'Promedio', 'Total Evaluaciones', 'Nota Mínima', 'Nota Máxima'];
      const rows = result.rows.map((row: any) => [
        row.estudiante_rut,
        row.estudiante_nombre,
        row.curso_nombre,
        row.asignatura_nombre,
        row.periodo,
        row.anio_lectivo,
        row.promedio,
        row.total_evaluaciones,
        row.nota_minima,
        row.nota_maxima,
      ]);

      const csv = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="reporte_calificaciones_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error generating reporte calificaciones:', error);
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 });
  }
}
