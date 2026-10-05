import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { ApoderadoCreate, ApoderadoUpdate } from '@/types/educacion';

// GET /api/educacion/apoderados - Listar apoderados
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const db = await getDb();
    
    let query = `
      SELECT a.*,
             (SELECT COUNT(*) FROM educacion_estudiante_apoderado ea WHERE ea.apoderado_id = a.id) as total_pupilos
      FROM educacion_apoderados a
      WHERE a.company_id = $1
    `;
    const params: any[] = [user.company_id];

    if (search) {
      query += ` AND (a.nombres ILIKE $2 OR a.apellido_paterno ILIKE $2 OR a.rut ILIKE $2)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY a.apellido_paterno, a.nombres`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching apoderados:', error);
    return NextResponse.json({ error: 'Error al obtener apoderados' }, { status: 500 });
  }
}

// POST /api/educacion/apoderados - Crear apoderado
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: ApoderadoCreate = await request.json();

    if (!body.rut || !body.nombres || !body.apellido_paterno) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    // Verificar RUT duplicado
    const existing = await db.query(
      'SELECT id FROM educacion_apoderados WHERE rut = $1 AND company_id = $2',
      [body.rut, user.company_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Ya existe un apoderado con este RUT' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO educacion_apoderados 
       (company_id, rut, nombres, apellido_paterno, apellido_materno, telefono, email, direccion, ocupacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        user.company_id,
        body.rut,
        body.nombres,
        body.apellido_paterno,
        body.apellido_materno || null,
        body.telefono || null,
        body.email || null,
        body.direccion || null,
        body.ocupacion || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating apoderado:', error);
    return NextResponse.json({ error: 'Error al crear apoderado' }, { status: 500 });
  }
}
