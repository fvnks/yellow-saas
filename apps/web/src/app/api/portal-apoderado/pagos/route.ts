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

    // Obtener pensiones de todos los pupilos del apoderado
    const result = await db.query(
      `SELECT 
        p.id,
        p.mes,
        p.anio,
        p.monto,
        p.fecha_vencimiento,
        p.estado,
        p.fecha_pago,
        p.metodo_pago,
        e.nombres as estudiante_nombres,
        e.apellido_paterno as estudiante_apellido,
        e.rut as estudiante_rut,
        c.nombre as curso_nombre
       FROM educacion_pensiones p
       JOIN educacion_estudiantes e ON p.estudiante_id = e.id
       LEFT JOIN educacion_cursos c ON e.curso_id = c.id
       JOIN educacion_estudiante_apoderado ea ON e.id = ea.estudiante_id
       WHERE ea.apoderado_id = $1
       ORDER BY e.apellido_paterno, p.anio DESC, p.mes DESC`,
      [sesion.id]
    );

    // Agrupar por estudiante
    const pagosPorEstudiante = result.rows.reduce((acc, row) => {
      const key = row.estudiante_rut;
      if (!acc[key]) {
        acc[key] = {
          estudiante: {
            nombres: row.estudiante_nombres,
            apellido_paterno: row.estudiante_apellido,
            rut: row.estudiante_rut,
            curso: row.curso_nombre,
          },
          pensiones: [],
        };
      }
      acc[key].pensiones.push({
        id: row.id,
        mes: row.mes,
        anio: row.anio,
        monto: row.monto,
        fecha_vencimiento: row.fecha_vencimiento,
        estado: row.estado,
        fecha_pago: row.fecha_pago,
        metodo_pago: row.metodo_pago,
      });
      return acc;
    }, {});

    return NextResponse.json({
      data: Object.values(pagosPorEstudiante),
    });
  } catch (error) {
    console.error('Error fetching pagos:', error);
    return NextResponse.json(
      { error: 'Error al obtener pagos' },
      { status: 500 }
    );
  }
}
