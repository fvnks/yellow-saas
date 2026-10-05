import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/educacion/subvenciones - Listar subvenciones
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const anio = searchParams.get('anio');
    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');

    const db = await getDb();
    
    let query = `SELECT * FROM educacion_subvenciones WHERE company_id = $1`;
    const params: any[] = [user.company_id];

    if (anio) {
      query += ` AND anio = $${params.length + 1}`;
      params.push(parseInt(anio));
    }

    if (tipo) {
      query += ` AND tipo = $${params.length + 1}`;
      params.push(tipo);
    }

    if (estado) {
      query += ` AND estado = $${params.length + 1}`;
      params.push(estado);
    }

    query += ` ORDER BY anio DESC, tipo`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching subvenciones:', error);
    return NextResponse.json({ error: 'Error al obtener subvenciones' }, { status: 500 });
  }
}

// POST /api/educacion/subvenciones - Crear subvención
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.tipo || !body.anio) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.query(
      `INSERT INTO educacion_subvenciones 
       (company_id, tipo, anio, monto, estado, fecha_recepcion, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        user.company_id,
        body.tipo,
        body.anio,
        body.monto || null,
        body.estado || null,
        body.fecha_recepcion || null,
        body.observaciones || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating subvencion:', error);
    return NextResponse.json({ error: 'Error al crear subvención' }, { status: 500 });
  }
}
