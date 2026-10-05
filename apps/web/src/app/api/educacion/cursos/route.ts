import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { CursoCreate, CursoUpdate } from '@/types/educacion';

// GET /api/educacion/cursos - Listar cursos
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const anio_lectivo = searchParams.get('anio_lectivo');
    const nivel = searchParams.get('nivel');

    const db = await getDb();
    
    let query = `
      SELECT c.*, 
             p.nombres as profesor_jefe_nombres, 
             p.apellido_paterno as profesor_jefe_apellido,
             (SELECT COUNT(*) FROM educacion_estudiantes e WHERE e.curso_id = c.id AND e.estado = 'activo') as total_estudiantes
      FROM educacion_cursos c
      LEFT JOIN educacion_profesores p ON c.profesor_jefe_id = p.id
      WHERE c.company_id = $1
    `;
    const params: any[] = [user.company_id];

    if (anio_lectivo) {
      query += ` AND c.anio_lectivo = $${params.length + 1}`;
      params.push(parseInt(anio_lectivo));
    }

    if (nivel) {
      query += ` AND c.nivel = $${params.length + 1}`;
      params.push(nivel);
    }

    query += ` ORDER BY c.nivel, c.nombre`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching cursos:', error);
    return NextResponse.json({ error: 'Error al obtener cursos' }, { status: 500 });
  }
}

// POST /api/educacion/cursos - Crear curso
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: CursoCreate = await request.json();

    if (!body.nombre || !body.nivel || !body.anio_lectivo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.query(
      `INSERT INTO educacion_cursos 
       (company_id, nombre, nivel, jornada, profesor_jefe_id, anio_lectivo, cupo_maximo, sala)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        user.company_id,
        body.nombre,
        body.nivel,
        body.jornada || null,
        body.profesor_jefe_id || null,
        body.anio_lectivo,
        body.cupo_maximo || null,
        body.sala || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating curso:', error);
    return NextResponse.json({ error: 'Error al crear curso' }, { status: 500 });
  }
}
