import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { EventoCreate } from '@/types/educacion';

// GET /api/educacion/eventos - Listar eventos
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const curso_id = searchParams.get('curso_id');
    const tipo = searchParams.get('tipo');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');

    const db = await getDb();
    
    let query = `
      SELECT e.*,
             c.nombre as curso_nombre
      FROM educacion_eventos e
      LEFT JOIN educacion_cursos c ON e.curso_id = c.id
      WHERE e.company_id = $1
    `;
    const params: any[] = [user.company_id];

    if (curso_id) {
      query += ` AND e.curso_id = $${params.length + 1}`;
      params.push(curso_id);
    }

    if (tipo) {
      query += ` AND e.tipo = $${params.length + 1}`;
      params.push(tipo);
    }

    if (fecha_desde) {
      query += ` AND e.fecha_inicio >= $${params.length + 1}`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND e.fecha_inicio <= $${params.length + 1}`;
      params.push(fecha_hasta);
    }

    query += ` ORDER BY e.fecha_inicio DESC`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching eventos:', error);
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 });
  }
}

// POST /api/educacion/eventos - Crear evento
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: EventoCreate = await request.json();

    if (!body.titulo || !body.tipo || !body.fecha_inicio) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.query(
      `INSERT INTO educacion_eventos 
       (company_id, titulo, descripcion, tipo, fecha_inicio, fecha_termino, curso_id, ubicacion, requiere_autorizacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        user.company_id,
        body.titulo,
        body.descripcion || null,
        body.tipo,
        body.fecha_inicio,
        body.fecha_termino || null,
        body.curso_id || null,
        body.ubicacion || null,
        body.requiere_autorizacion || false
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating evento:', error);
    return NextResponse.json({ error: 'Error al crear evento' }, { status: 500 });
  }
}
