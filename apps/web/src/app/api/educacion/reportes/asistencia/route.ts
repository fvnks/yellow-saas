import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/educacion/reportes/asistencia - Reporte de asistencia
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const curso_id = searchParams.get('curso_id');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const formato = searchParams.get('formato') || 'json';

    const db = await getDb();
    
    let query = `
      SELECT 
        e.rut as estudiante_rut,
        e.nombres || ' ' || e.apellido_paterno || ' ' || COALESCE(e.apellido_materno, '') as estudiante_nombre,
        c.nombre as curso_nombre,
        COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) as presentes,
        COUNT(CASE WHEN a.estado = 'ausente' THEN 1 END) as ausentes,
        COUNT(CASE WHEN a.estado = 'atrasado' THEN 1 END) as atrasos,
        COUNT(CASE WHEN a.estado = 'justificado' THEN 1 END) as justificados,
        COUNT(*) as total,
        ROUND(COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as porcentaje_asistencia
      FROM educacion_estudiantes e
      JOIN educacion_cursos c ON e.curso_id = c.id
      LEFT JOIN educacion_asistencia a ON e.id = a.estudiante_id
      WHERE e.company_id = $1
    `;
    const params: any[] = [user.company_id];

    if (curso_id) {
      query += ` AND e.curso_id = $${params.length + 1}`;
      params.push(curso_id);
    }

    if (fecha_desde) {
      query += ` AND a.fecha >= $${params.length + 1}`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND a.fecha <= $${params.length + 1}`;
      params.push(fecha_hasta);
    }

    query += ` GROUP BY e.id, e.rut, e.nombres, e.apellido_paterno, e.apellido_materno, c.nombre ORDER BY c.nombre, e.apellido_paterno`;

    const result = await db.query(query, params);

    // Si se solicita formato CSV
    if (formato === 'csv') {
      const headers = ['RUT', 'Estudiante', 'Curso', 'Presentes', 'Ausentes', 'Atrasos', 'Justificados', 'Total', '% Asistencia'];
      const rows = result.rows.map((row: any) => [
        row.estudiante_rut,
        row.estudiante_nombre,
        row.curso_nombre,
        row.presentes,
        row.ausentes,
        row.atrasos,
        row.justificados,
        row.total,
        row.porcentaje_asistencia || 0,
      ]);

      const csv = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="reporte_asistencia_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error generating reporte asistencia:', error);
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 });
  }
}
