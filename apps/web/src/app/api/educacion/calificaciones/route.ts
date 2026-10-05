import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { CalificacionCreate, CalificacionUpdate } from '@/types/educacion';

// GET /api/educacion/calificaciones - Listar calificaciones
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const curso_id = searchParams.get('curso_id');
    const estudiante_id = searchParams.get('estudiante_id');
    const periodo = searchParams.get('periodo');
    const anio_lectivo = searchParams.get('anio_lectivo');

    const db = await getDb();
    
    let query = `
      SELECT cal.*,
             e.nombres as estudiante_nombres,
             e.apellido_paterno as estudiante_apellido,
             a.nombre as asignatura_nombre,
             c.nombre as curso_nombre
      FROM educacion_calificaciones cal
      JOIN educacion_estudiantes e ON cal.estudiante_id = e.id
      JOIN educacion_curso_asignatura ca ON cal.curso_asignatura_id = ca.id
      JOIN educacion_asignaturas a ON ca.asignatura_id = a.id
      JOIN educacion_cursos c ON ca.curso_id = c.id
      WHERE cal.company_id = $1
    `;
    const params: any[] = [user.company_id];

    if (curso_id) {
      query += ` AND ca.curso_id = $${params.length + 1}`;
      params.push(curso_id);
    }

    if (estudiante_id) {
      query += ` AND cal.estudiante_id = $${params.length + 1}`;
      params.push(estudiante_id);
    }

    if (periodo) {
      query += ` AND cal.periodo = $${params.length + 1}`;
      params.push(parseInt(periodo));
    }

    if (anio_lectivo) {
      query += ` AND cal.anio_lectivo = $${params.length + 1}`;
      params.push(parseInt(anio_lectivo));
    }

    query += ` ORDER BY e.apellido_paterno, e.nombres, a.nombre, cal.periodo`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching calificaciones:', error);
    return NextResponse.json({ error: 'Error al obtener calificaciones' }, { status: 500 });
  }
}

// POST /api/educacion/calificaciones - Crear calificación
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const rawBody = await request.json();
    const body: any = rawBody;

    const faltaCursoAsignatura =
      !body.curso_asignatura_id && (!body.curso_id || !body.asignatura_id);

    if (!body.estudiante_id || faltaCursoAsignatura || !body.periodo || !body.anio_lectivo || !body.nota || !body.tipo_evaluacion) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    if (body.nota < 1.0 || body.nota > 7.0) {
      return NextResponse.json({ error: 'La nota debe estar entre 1.0 y 7.0' }, { status: 400 });
    }

    const db = await getDb();

    // Permite enviar `curso_id` + `asignatura_id` en vez del id de la tabla
    // intermedia; la asignación se crea o reutiliza en ese caso.
    let cursoAsignaturaId = body.curso_asignatura_id;

    if (!cursoAsignaturaId && body.curso_id && body.asignatura_id) {
      const existente = await db.query(
        `SELECT id FROM educacion_curso_asignatura
          WHERE curso_id = $1 AND asignatura_id = $2 AND anio_lectivo = $3
          LIMIT 1`,
        [body.curso_id, body.asignatura_id, body.anio_lectivo]
      );

      if (existente.rows.length > 0) {
        cursoAsignaturaId = existente.rows[0].id;
      } else {
        const creada = await db.query(
          `INSERT INTO educacion_curso_asignatura
             (curso_id, asignatura_id, anio_lectivo)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [body.curso_id, body.asignatura_id, body.anio_lectivo]
        );
        cursoAsignaturaId = creada.rows[0].id;
      }
    }

    const result = await db.query(
      `INSERT INTO educacion_calificaciones 
       (company_id, estudiante_id, curso_asignatura_id, periodo, anio_lectivo, nota, tipo_evaluacion, descripcion, fecha_evaluacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (estudiante_id, curso_asignatura_id, periodo, tipo_evaluacion, descripcion)
       DO UPDATE SET nota = $6, fecha_evaluacion = $9
       RETURNING *`,
      [
        user.company_id,
        body.estudiante_id,
        cursoAsignaturaId,
        body.periodo,
        body.anio_lectivo,
        body.nota,
        body.tipo_evaluacion,
        body.descripcion || null,
        body.fecha_evaluacion || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating calificacion:', error);
    return NextResponse.json({ error: 'Error al crear calificación' }, { status: 500 });
  }
}
