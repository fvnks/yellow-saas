import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/educacion/postulaciones - Listar postulaciones
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const nivel = searchParams.get('nivel');
    const anio = searchParams.get('anio');

    const db = await getDb();
    
    let query = `SELECT * FROM educacion_postulaciones WHERE company_id = $1`;
    const params: any[] = [user.company_id];

    if (estado) {
      query += ` AND estado = $${params.length + 1}`;
      params.push(estado);
    }

    if (nivel) {
      query += ` AND nivel_postulacion = $${params.length + 1}`;
      params.push(nivel);
    }

    if (anio) {
      query += ` AND anio_postulacion = $${params.length + 1}`;
      params.push(parseInt(anio));
    }

    query += ` ORDER BY fecha_postulacion DESC`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching postulaciones:', error);
    return NextResponse.json({ error: 'Error al obtener postulaciones' }, { status: 500 });
  }
}

// POST /api/educacion/postulaciones - Crear postulación
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.estudiante_nombres || !body.estudiante_apellido_paterno) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.query(
      `INSERT INTO educacion_postulaciones 
       (company_id, estudiante_nombres, estudiante_apellido_paterno, estudiante_apellido_materno, 
        estudiante_fecha_nacimiento, apoderado_nombres, apoderado_apellido_paterno, 
        apoderado_email, apoderado_telefono, nivel_postulacion, anio_postulacion, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        user.company_id,
        body.estudiante_nombres,
        body.estudiante_apellido_paterno,
        body.estudiante_apellido_materno || null,
        body.estudiante_fecha_nacimiento || null,
        body.apoderado_nombres || null,
        body.apoderado_apellido_paterno || null,
        body.apoderado_email || null,
        body.apoderado_telefono || null,
        body.nivel_postulacion || null,
        body.anio_postulacion || null,
        body.observaciones || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating postulacion:', error);
    return NextResponse.json({ error: 'Error al crear postulación' }, { status: 500 });
  }
}
