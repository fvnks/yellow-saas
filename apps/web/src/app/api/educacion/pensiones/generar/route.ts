import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

/**
 * POST /api/educacion/pensiones/generar
 * Crea una pensión `pendiente` para cada estudiante activo de la empresa para
 * el mes/año indicados. Usa ON CONFLICT sobre (estudiante_id, mes, anio), por
 * lo que es idempotente: los registros ya existentes se respetan.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { mes, anio, monto, fecha_vencimiento } = body;

    if (
      typeof mes !== 'number' || mes < 1 || mes > 12 ||
      typeof anio !== 'number' ||
      typeof monto !== 'number' || monto <= 0 ||
      !fecha_vencimiento
    ) {
      return NextResponse.json(
        { error: 'Debes indicar mes (1-12), año, monto (>0) y fecha de vencimiento' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.query(
      `INSERT INTO educacion_pensiones
         (company_id, estudiante_id, mes, anio, monto, fecha_vencimiento, estado)
       SELECT $1, e.id, $2, $3, $4, $5, 'pendiente'
         FROM educacion_estudiantes e
        WHERE e.company_id = $1 AND e.estado = 'activo'
   ON CONFLICT (estudiante_id, mes, anio) DO NOTHING`,
      [user.company_id, mes, anio, monto, fecha_vencimiento]
    );

    return NextResponse.json(
      { data: { generadas: result.rowCount ?? 0 } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generando pensiones:', error);
    return NextResponse.json({ error: 'Error al generar pensiones' }, { status: 500 });
  }
}
