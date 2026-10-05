import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { AsignaturaUpdate } from '@/types/educacion';

// GET /api/educacion/asignaturas/:id - Obtener asignatura
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
      `SELECT a.*,
              (SELECT COUNT(*) FROM educacion_curso_asignatura ca WHERE ca.asignatura_id = a.id) as total_cursos
       FROM educacion_asignaturas a
       WHERE a.id = $1 AND a.company_id = $2`,
      [id, user.company_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Asignatura no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching asignatura:', error);
    return NextResponse.json({ error: 'Error al obtener asignatura' }, { status: 500 });
  }
}

// PUT /api/educacion/asignaturas/:id - Actualizar asignatura
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
    const body: AsignaturaUpdate = await request.json();
    const db = await getDb();

    const result = await db.query(
      `UPDATE educacion_asignaturas SET
        codigo = COALESCE($1, codigo),
        nombre = COALESCE($2, nombre),
        nivel = COALESCE($3, nivel),
        horas_semanales = COALESCE($4, horas_semanales),
        activo = COALESCE($5, activo)
       WHERE id = $6 AND company_id = $7
       RETURNING *`,
      [
        body.codigo || null,
        body.nombre || null,
        body.nivel || null,
        body.horas_semanales || null,
        body.activo !== undefined ? body.activo : null,
        id,
        user.company_id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Asignatura no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating asignatura:', error);
    return NextResponse.json({ error: 'Error al actualizar asignatura' }, { status: 500 });
  }
}

// DELETE /api/educacion/asignaturas/:id - Eliminar asignatura
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
      'DELETE FROM educacion_asignaturas WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, user.company_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Asignatura no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Asignatura eliminada' });
  } catch (error) {
    console.error('Error deleting asignatura:', error);
    return NextResponse.json({ error: 'Error al eliminar asignatura' }, { status: 500 });
  }
}
