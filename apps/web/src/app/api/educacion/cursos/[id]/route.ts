import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { CursoUpdate } from '@/types/educacion';

// GET /api/educacion/cursos/:id - Obtener curso
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
      `SELECT c.*, 
              p.nombres as profesor_jefe_nombres, 
              p.apellido_paterno as profesor_jefe_apellido
       FROM educacion_cursos c
       LEFT JOIN educacion_profesores p ON c.profesor_jefe_id = p.id
       WHERE c.id = $1 AND c.company_id = $2`,
      [id, user.company_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    // Obtener estudiantes del curso
    const estudiantes = await db.query(
      `SELECT id, rut, nombres, apellido_paterno, apellido_materno, estado
       FROM educacion_estudiantes
       WHERE curso_id = $1 AND estado = 'activo'
       ORDER BY apellido_paterno, nombres`,
      [id]
    );

    // Obtener asignaturas del curso
    const asignaturas = await db.query(
      `SELECT ca.id, ca.profesor_id, a.nombre as asignatura_nombre, a.codigo,
              p.nombres as profesor_nombres, p.apellido_paterno as profesor_apellido
       FROM educacion_curso_asignatura ca
       JOIN educacion_asignaturas a ON ca.asignatura_id = a.id
       LEFT JOIN educacion_profesores p ON ca.profesor_id = p.id
       WHERE ca.curso_id = $1 AND ca.anio_lectivo = $2`,
      [id, result.rows[0].anio_lectivo]
    );

    return NextResponse.json({
      data: {
        ...result.rows[0],
        estudiantes: estudiantes.rows,
        asignaturas: asignaturas.rows
      }
    });
  } catch (error) {
    console.error('Error fetching curso:', error);
    return NextResponse.json({ error: 'Error al obtener curso' }, { status: 500 });
  }
}

// PUT /api/educacion/cursos/:id - Actualizar curso
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
    const body: CursoUpdate = await request.json();
    const db = await getDb();

    const result = await db.query(
      `UPDATE educacion_cursos SET
        nombre = COALESCE($1, nombre),
        nivel = COALESCE($2, nivel),
        jornada = COALESCE($3, jornada),
        profesor_jefe_id = COALESCE($4, profesor_jefe_id),
        cupo_maximo = COALESCE($5, cupo_maximo),
        sala = COALESCE($6, sala),
        activo = COALESCE($7, activo)
       WHERE id = $8 AND company_id = $9
       RETURNING *`,
      [
        body.nombre || null,
        body.nivel || null,
        body.jornada || null,
        body.profesor_jefe_id || null,
        body.cupo_maximo || null,
        body.sala || null,
        body.activo !== undefined ? body.activo : null,
        id,
        user.company_id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating curso:', error);
    return NextResponse.json({ error: 'Error al actualizar curso' }, { status: 500 });
  }
}

// DELETE /api/educacion/cursos/:id - Eliminar curso
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

    // Verificar que no tenga estudiantes activos
    const estudiantes = await db.query(
      'SELECT COUNT(*) FROM educacion_estudiantes WHERE curso_id = $1 AND estado = $2',
      [id, 'activo']
    );

    if (parseInt(estudiantes.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un curso con estudiantes activos' },
        { status: 400 }
      );
    }

    const result = await db.query(
      'DELETE FROM educacion_cursos WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, user.company_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Curso eliminado' });
  } catch (error) {
    console.error('Error deleting curso:', error);
    return NextResponse.json({ error: 'Error al eliminar curso' }, { status: 500 });
  }
}
