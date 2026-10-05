import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/educacion/reportes/morosidad - Reporte de morosidad
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio') || '2026';
    const formato = searchParams.get('formato') || 'json';

    const db = await getDb();
    
    let query = `
      SELECT 
        e.rut as estudiante_rut,
        e.nombres || ' ' || e.apellido_paterno || ' ' || COALESCE(e.apellido_materno, '') as estudiante_nombre,
        c.nombre as curso_nombre,
        p.mes,
        p.anio,
        p.monto,
        p.fecha_vencimiento,
        p.estado,
        p.fecha_pago,
        p.metodo_pago,
        CASE 
          WHEN p.estado = 'vencida' THEN CURRENT_DATE - p.fecha_vencimiento
          ELSE 0
        END as dias_mora
      FROM educacion_pensiones p
      JOIN educacion_estudiantes e ON p.estudiante_id = e.id
      LEFT JOIN educacion_cursos c ON e.curso_id = c.id
      WHERE p.company_id = $1 AND p.anio = $2
    `;
    const params: any[] = [user.company_id, parseInt(anio)];

    if (mes) {
      query += ` AND p.mes = $${params.length + 1}`;
      params.push(parseInt(mes));
    }

    query += ` ORDER BY p.mes, e.apellido_paterno`;

    const result = await db.query(query, params);

    // Calcular totales
    const totales = {
      total_pendiente: 0,
      total_vencido: 0,
      total_pagado: 0,
      cantidad_pendiente: 0,
      cantidad_vencido: 0,
      cantidad_pagado: 0,
    };

    result.rows.forEach((row: any) => {
      if (row.estado === 'pendiente') {
        totales.total_pendiente += row.monto;
        totales.cantidad_pendiente++;
      } else if (row.estado === 'vencida') {
        totales.total_vencido += row.monto;
        totales.cantidad_vencido++;
      } else if (row.estado === 'pagada') {
        totales.total_pagado += row.monto;
        totales.cantidad_pagado++;
      }
    });

    // Si se solicita formato CSV
    if (formato === 'csv') {
      const headers = ['RUT', 'Estudiante', 'Curso', 'Mes', 'Año', 'Monto', 'Vencimiento', 'Estado', 'Fecha Pago', 'Método Pago', 'Días Mora'];
      const rows = result.rows.map((row: any) => [
        row.estudiante_rut,
        row.estudiante_nombre,
        row.curso_nombre,
        row.mes,
        row.anio,
        row.monto,
        row.fecha_vencimiento,
        row.estado,
        row.fecha_pago || '',
        row.metodo_pago || '',
        row.dias_mora,
      ]);

      const csv = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="reporte_morosidad_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      data: result.rows,
      totales,
    });
  } catch (error) {
    console.error('Error generating reporte morosidad:', error);
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 });
  }
}
