import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { MatriculaCreate } from '@/types/educacion';

// GET /api/educacion/matriculas - Listar matrículas
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estudiante_id = searchParams.get('estudiante_id');
    const curso_id = searchParams.get('curso_id');
    const anio_lectivo = searchParams.get('anio_lectivo');
    const estado = searchParams.get('estado');

    const db = await getDb();
    
    let query = `
      SELECT m.*,
             e.nombres as estudiante_nombres,
             e.apellido_paterno as estudiante_apellido,
             e.rut as estudiante_rut,
             c.nombre as curso_nombre
      FROM educacion_matriculas m
      JOIN educacion_estudiantes e ON m.estudiante_id = e.id
      JOIN educacion_cursos c ON m.curso_id = c.id
      WHERE m.company_id = $1
    `;
    const params: any[] = [user.company_id];

    if (estudiante_id) {
      query += ` AND m.estudiante_id = $${params.length + 1}`;
      params.push(estudiante_id);
    }

    if (curso_id) {
      query += ` AND m.curso_id = $${params.length + 1}`;
      params.push(curso_id);
    }

    if (anio_lectivo) {
      query += ` AND m.anio_lectivo = $${params.length + 1}`;
      params.push(parseInt(anio_lectivo));
    }

    if (estado) {
      query += ` AND m.estado = $${params.length + 1}`;
      params.push(estado);
    }

    query += ` ORDER BY m.anio_lectivo DESC, e.apellido_paterno`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching matriculas:', error);
    return NextResponse.json({ error: 'Error al obtener matrículas' }, { status: 500 });
  }
}

// POST /api/educacion/matriculas - Crear matrícula
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: MatriculaCreate = await request.json();

    if (!body.estudiante_id || !body.curso_id || !body.anio_lectivo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.query(
      `INSERT INTO educacion_matriculas 
       (company_id, estudiante_id, curso_id, anio_lectivo, fecha_matricula, observaciones)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)
       RETURNING *`,
      [
        user.company_id,
        body.estudiante_id,
        body.curso_id,
        body.anio_lectivo,
        body.observaciones || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating matricula:', error);
    return NextResponse.json({ error: 'Error al crear matrícula' }, { status: 500 });
  }
}
