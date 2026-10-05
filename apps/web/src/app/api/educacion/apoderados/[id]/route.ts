import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { ApoderadoUpdate } from '@/types/educacion';

// GET /api/educacion/apoderados/:id - Obtener apoderado
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
              (SELECT COUNT(*) FROM educacion_estudiante_apoderado ea WHERE ea.apoderado_id = a.id) as total_pupilos
       FROM educacion_apoderados a
       WHERE a.id = $1 AND a.company_id = $2`,
      [id, user.company_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Apoderado no encontrado' }, { status: 404 });
    }

    // Obtener pupilos
    const pupilos = await db.query(
      `SELECT ea.*, e.nombres, e.apellido_paterno, e.apellido_materno, e.rut, c.nombre as curso_nombre
       FROM educacion_estudiante_apoderado ea
       JOIN educacion_estudiantes e ON ea.estudiante_id = e.id
       LEFT JOIN educacion_cursos c ON e.curso_id = c.id
       WHERE ea.apoderado_id = $1`,
      [id]
    );

    return NextResponse.json({
      data: {
        ...result.rows[0],
        pupilos: pupilos.rows
      }
    });
  } catch (error) {
    console.error('Error fetching apoderado:', error);
    return NextResponse.json({ error: 'Error al obtener apoderado' }, { status: 500 });
  }
}

// PUT /api/educacion/apoderados/:id - Actualizar apoderado
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
    const body: ApoderadoUpdate = await request.json();
    const db = await getDb();

    const result = await db.query(
      `UPDATE educacion_apoderados SET
        nombres = COALESCE($1, nombres),
        apellido_paterno = COALESCE($2, apellido_paterno),
        apellido_materno = COALESCE($3, apellido_materno),
        telefono = COALESCE($4, telefono),
        email = COALESCE($5, email),
        direccion = COALESCE($6, direccion),
        ocupacion = COALESCE($7, ocupacion)
       WHERE id = $8 AND company_id = $9
       RETURNING *`,
      [
        body.nombres || null,
        body.apellido_paterno || null,
        body.apellido_materno || null,
        body.telefono || null,
        body.email || null,
        body.direccion || null,
        body.ocupacion || null,
        id,
        user.company_id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Apoderado no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating apoderado:', error);
    return NextResponse.json({ error: 'Error al actualizar apoderado' }, { status: 500 });
  }
}

// DELETE /api/educacion/apoderados/:id - Eliminar apoderado
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
      'DELETE FROM educacion_apoderados WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, user.company_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Apoderado no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Apoderado eliminado' });
  } catch (error) {
    console.error('Error deleting apoderado:', error);
    return NextResponse.json({ error: 'Error al eliminar apoderado' }, { status: 500 });
  }
}
