import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { AsignaturaCreate, AsignaturaUpdate } from '@/types/educacion';

// GET /api/educacion/asignaturas - Listar asignaturas
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nivel = searchParams.get('nivel');

    const db = await getDb();
    
    let query = `
      SELECT a.*,
             (SELECT COUNT(*) FROM educacion_curso_asignatura ca WHERE ca.asignatura_id = a.id) as total_cursos
      FROM educacion_asignaturas a
      WHERE a.company_id = $1
    `;
    const params: any[] = [user.company_id];

    if (nivel) {
      query += ` AND a.nivel = $2`;
      params.push(nivel);
    }

    query += ` ORDER BY a.nombre`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching asignaturas:', error);
    return NextResponse.json({ error: 'Error al obtener asignaturas' }, { status: 500 });
  }
}

// POST /api/educacion/asignaturas - Crear asignatura
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: AsignaturaCreate = await request.json();

    if (!body.nombre) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.query(
      `INSERT INTO educacion_asignaturas 
       (company_id, codigo, nombre, nivel, horas_semanales)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        user.company_id,
        body.codigo || null,
        body.nombre,
        body.nivel || null,
        body.horas_semanales || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating asignatura:', error);
    return NextResponse.json({ error: 'Error al crear asignatura' }, { status: 500 });
  }
}
