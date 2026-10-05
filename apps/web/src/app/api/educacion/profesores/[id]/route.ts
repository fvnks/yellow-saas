import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { ProfesorUpdate } from '@/types/educacion';

// GET /api/educacion/profesores/:id - Obtener profesor
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
              (SELECT COUNT(*) FROM educacion_cursos c WHERE c.profesor_jefe_id = p.id) as cursos_jefe,
              (SELECT COUNT(*) FROM educacion_curso_asignatura ca WHERE ca.profesor_id = p.id) as asignaturas
       FROM educacion_profesores p
       WHERE p.id = $1 AND p.company_id = $2`,
      [id, user.company_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching profesor:', error);
    return NextResponse.json({ error: 'Error al obtener profesor' }, { status: 500 });
  }
}

// PUT /api/educacion/profesores/:id - Actualizar profesor
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
    const body: ProfesorUpdate = await request.json();
    const db = await getDb();

    const result = await db.query(
      `UPDATE educacion_profesores SET
        nombres = COALESCE($1, nombres),
        apellido_paterno = COALESCE($2, apellido_paterno),
        apellido_materno = COALESCE($3, apellido_materno),
        email = COALESCE($4, email),
        telefono = COALESCE($5, telefono),
        especialidad = COALESCE($6, especialidad),
        titulo = COALESCE($7, titulo),
        estado = COALESCE($8, estado)
       WHERE id = $9 AND company_id = $10
       RETURNING *`,
      [
        body.nombres || null,
        body.apellido_paterno || null,
        body.apellido_materno || null,
        body.email || null,
        body.telefono || null,
        body.especialidad || null,
        body.titulo || null,
        body.estado || null,
        id,
        user.company_id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating profesor:', error);
    return NextResponse.json({ error: 'Error al actualizar profesor' }, { status: 500 });
  }
}

// DELETE /api/educacion/profesores/:id - Eliminar profesor
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
      'DELETE FROM educacion_profesores WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, user.company_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profesor eliminado' });
  } catch (error) {
    console.error('Error deleting profesor:', error);
    return NextResponse.json({ error: 'Error al eliminar profesor' }, { status: 500 });
  }
}
