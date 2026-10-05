import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { PensionUpdate } from '@/types/educacion';

// GET /api/educacion/pensiones/:id - Obtener pension
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();

    const result = await db.query(
      `SELECT p.*,
              e.nombres as estudiante_nombres,
              e.apellido_paterno as estudiante_apellido,
              e.rut as estudiante_rut,
              c.nombre as curso_nombre
       FROM educacion_pensiones p
       JOIN educacion_estudiantes e ON p.estudiante_id = e.id
       LEFT JOIN educacion_cursos c ON e.curso_id = c.id
       WHERE p.id = $1 AND p.company_id = $2`,
      [id, user.company_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pension no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching pension:', error);
    return NextResponse.json({ error: 'Error al obtener pension' }, { status: 500 });
  }
}

// PUT /api/educacion/pensiones/:id - Actualizar pension
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body: PensionUpdate = await request.json();
    const db = await getDb();

    const result = await db.query(
      `UPDATE educacion_pensiones SET
        estado = COALESCE($1, estado),
        fecha_pago = COALESCE($2, fecha_pago),
        metodo_pago = COALESCE($3, metodo_pago)
       WHERE id = $4 AND company_id = $5
       RETURNING *`,
      [
        body.estado || null,
        body.fecha_pago || null,
        body.metodo_pago || null,
        id,
        user.company_id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pension no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating pension:', error);
    return NextResponse.json({ error: 'Error al actualizar pension' }, { status: 500 });
  }
}

// DELETE /api/educacion/pensiones/:id - Eliminar pension
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();

    const result = await db.query(
      'DELETE FROM educacion_pensiones WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, user.company_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pension no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pension eliminada' });
  } catch (error) {
    console.error('Error deleting pension:', error);
    return NextResponse.json({ error: 'Error al eliminar pension' }, { status: 500 });
  }
}
