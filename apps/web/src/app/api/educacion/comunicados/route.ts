import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { ComunicadoCreate, ComunicadoUpdate } from '@/types/educacion';

// GET /api/educacion/comunicados - Listar comunicados
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const curso_id = searchParams.get('curso_id');

    const db = await getDb();
    
    let query = `
      SELECT c.*,
             cu.nombre as curso_nombre
      FROM educacion_comunicados c
      LEFT JOIN educacion_cursos cu ON c.curso_id = cu.id
      WHERE c.company_id = $1 AND c.activo = true
    `;
    const params: any[] = [user.company_id];

    if (tipo) {
      query += ` AND c.tipo = $${params.length + 1}`;
      params.push(tipo);
    }

    if (curso_id) {
      query += ` AND c.curso_id = $${params.length + 1}`;
      params.push(curso_id);
    }

    query += ` ORDER BY c.fecha_publicacion DESC`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching comunicados:', error);
    return NextResponse.json({ error: 'Error al obtener comunicados' }, { status: 500 });
  }
}

// POST /api/educacion/comunicados - Crear comunicado
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: ComunicadoCreate = await request.json();

    if (!body.titulo || !body.contenido || !body.tipo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.query(
      `INSERT INTO educacion_comunicados 
       (company_id, titulo, contenido, tipo, curso_id, nivel)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        user.company_id,
        body.titulo,
        body.contenido,
        body.tipo,
        body.curso_id || null,
        body.nivel || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating comunicado:', error);
    return NextResponse.json({ error: 'Error al crear comunicado' }, { status: 500 });
  }
}
