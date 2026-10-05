import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { EstudianteUpdate } from '@/types/educacion';

// GET /api/educacion/estudiantes/:id - Obtener estudiante
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
      `SELECT e.*, c.nombre as curso_nombre
       FROM educacion_estudiantes e
       LEFT JOIN educacion_cursos c ON e.curso_id = c.id
       WHERE e.id = $1 AND e.company_id = $2`,
      [id, user.company_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    // Obtener apoderados
    const apoderados = await db.query(
      `SELECT ea.*, a.nombres, a.apellido_paterno, a.apellido_materno, a.telefono, a.email
       FROM educacion_estudiante_apoderado ea
       JOIN educacion_apoderados a ON ea.apoderado_id = a.id
       WHERE ea.estudiante_id = $1`,
      [id]
    );

    return NextResponse.json({
      data: {
        ...result.rows[0],
        apoderados: apoderados.rows
      }
    });
  } catch (error) {
    console.error('Error fetching estudiante:', error);
    return NextResponse.json({ error: 'Error al obtener estudiante' }, { status: 500 });
  }
}

// PUT /api/educacion/estudiantes/:id - Actualizar estudiante
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
    const body: EstudianteUpdate = await request.json();
    const db = await getDb();

    // Verificar que existe
    const existing = await db.query(
      'SELECT id FROM educacion_estudiantes WHERE id = $1 AND company_id = $2',
      [id, user.company_id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    const result = await db.query(
      `UPDATE educacion_estudiantes SET
        nombres = COALESCE($1, nombres),
        apellido_paterno = COALESCE($2, apellido_paterno),
        apellido_materno = COALESCE($3, apellido_materno),
        fecha_nacimiento = COALESCE($4, fecha_nacimiento),
        genero = COALESCE($5, genero),
        direccion = COALESCE($6, direccion),
        telefono = COALESCE($7, telefono),
        email = COALESCE($8, email),
        curso_id = COALESCE($9, curso_id),
        estado = COALESCE($10, estado),
        observaciones = COALESCE($11, observaciones)
       WHERE id = $12 AND company_id = $13
       RETURNING *`,
      [
        body.nombres || null,
        body.apellido_paterno || null,
        body.apellido_materno || null,
        body.fecha_nacimiento || null,
        body.genero || null,
        body.direccion || null,
        body.telefono || null,
        body.email || null,
        body.curso_id || null,
        body.estado || null,
        body.observaciones || null,
        id,
        user.company_id
      ]
    );

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating estudiante:', error);
    return NextResponse.json({ error: 'Error al actualizar estudiante' }, { status: 500 });
  }
}

// DELETE /api/educacion/estudiantes/:id - Eliminar estudiante
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
      'DELETE FROM educacion_estudiantes WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, user.company_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Estudiante eliminado' });
  } catch (error) {
    console.error('Error deleting estudiante:', error);
    return NextResponse.json({ error: 'Error al eliminar estudiante' }, { status: 500 });
  }
}
