import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/educacion/reportes/mineduc - Exportación formato Mineduc
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const curso_id = searchParams.get('curso_id');
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio') || '2026';

    const db = await getDb();
    
    // Obtener datos de asistencia en formato Mineduc
    let query = `
      SELECT 
        e.rut as estudiante_rut,
        e.nombres || ' ' || e.apellido_paterno || ' ' || COALESCE(e.apellido_materno, '') as estudiante_nombre,
        c.nombre as curso_nombre,
        c.nivel,
        COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) as dias_presentes,
        COUNT(CASE WHEN a.estado = 'ausente' THEN 1 END) as dias_ausentes,
        COUNT(CASE WHEN a.estado = 'atrasado' THEN 1 END) as dias_atrasos,
        COUNT(CASE WHEN a.estado = 'justificado' THEN 1 END) as dias_justificados,
        COUNT(*) as dias_totales,
        ROUND(COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as porcentaje_asistencia
      FROM educacion_estudiantes e
      JOIN educacion_cursos c ON e.curso_id = c.id
      LEFT JOIN educacion_asistencia a ON e.id = a.estudiante_id
        AND a.fecha >= DATE_TRUNC('month', TO_DATE($2 || '-' || $3 || '-01', 'YYYY-MM-DD'))
        AND a.fecha < DATE_TRUNC('month', TO_DATE($2 || '-' || $3 || '-01', 'YYYY-MM-DD')) + INTERVAL '1 month'
      WHERE e.company_id = $1
    `;
    const params: any[] = [user.company_id, anio, mes || '1'];

    if (curso_id) {
      query += ` AND e.curso_id = $${params.length + 1}`;
      params.push(curso_id);
    }

    query += ` GROUP BY e.id, e.rut, e.nombres, e.apellido_paterno, e.apellido_materno, c.nombre, c.nivel ORDER BY c.nombre, e.apellido_paterno`;

    const result = await db.query(query, params);

    // Formato Mineduc (CSV con formato específico)
    const headers = [
      'RUT',
      'ESTUDIANTE',
      'CURSO',
      'NIVEL',
      'DIAS_PRESENTES',
      'DIAS_AUSENTES',
      'DIAS_ATRASOS',
      'DIAS_JUSTIFICADOS',
      'DIAS_TOTALES',
      'PORCENTAJE_ASISTENCIA'
    ];

    const rows = result.rows.map((row: any) => [
      row.estudiante_rut,
      row.estudiante_nombre,
      row.curso_nombre,
      row.nivel,
      row.dias_presentes,
      row.dias_ausentes,
      row.dias_atrasos,
      row.dias_justificados,
      row.dias_totales,
      row.porcentaje_asistencia || 0,
    ]);

    const csv = [headers.join(';'), ...rows.map((row: any[]) => row.join(';'))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="mineduc_asistencia_${mes || '01'}_${anio}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error generating reporte mineduc:', error);
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 });
  }
}
