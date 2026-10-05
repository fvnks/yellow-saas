import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { LibroCreate } from '@/types/educacion';

// GET /api/educacion/libros - Listar libros
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const activo = searchParams.get('activo');

    const db = await getDb();
    
    let query = `SELECT * FROM educacion_libros WHERE company_id = $1`;
    const params: any[] = [user.company_id];

    if (search) {
      query += ` AND (titulo ILIKE $${params.length + 1} OR autor ILIKE $${params.length + 1} OR isbn ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (activo !== null) {
      query += ` AND activo = $${params.length + 1}`;
      params.push(activo === 'true');
    }

    query += ` ORDER BY titulo`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching libros:', error);
    return NextResponse.json({ error: 'Error al obtener libros' }, { status: 500 });
  }
}

// POST /api/educacion/libros - Crear libro
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: LibroCreate = await request.json();

    if (!body.titulo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.query(
      `INSERT INTO educacion_libros 
       (company_id, isbn, titulo, autor, editorial, anio_publicacion, cantidad_total, cantidad_disponible, ubicacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8)
       RETURNING *`,
      [
        user.company_id,
        body.isbn || null,
        body.titulo,
        body.autor || null,
        body.editorial || null,
        body.anio_publicacion || null,
        body.cantidad_total || 1,
        body.ubicacion || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating libro:', error);
    return NextResponse.json({ error: 'Error al crear libro' }, { status: 500 });
  }
}
