import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/educacion/transporte/rutas - Listar rutas
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const db = await getDb();
    
    const result = await db.query(
      `SELECT r.*,
              (SELECT COUNT(*) FROM educacion_transporte_estudiantes te WHERE te.ruta_id = r.id) as total_estudiantes,
              (SELECT COUNT(*) FROM educacion_transporte_paraderos p WHERE p.ruta_id = r.id) as total_paraderos
       FROM educacion_transporte_rutas r
       WHERE r.company_id = $1
       ORDER BY r.nombre`,
      [user.company_id]
    );

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching rutas:', error);
    return NextResponse.json({ error: 'Error al obtener rutas' }, { status: 500 });
  }
}

// POST /api/educacion/transporte/rutas - Crear ruta
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.nombre) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.query(
      `INSERT INTO educacion_transporte_rutas 
       (company_id, nombre, conductor, patente)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        user.company_id,
        body.nombre,
        body.conductor || null,
        body.patente || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating ruta:', error);
    return NextResponse.json({ error: 'Error al crear ruta' }, { status: 500 });
  }
}
