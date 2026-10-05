import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { EstudianteCreate, EstudianteUpdate } from '@/types/educacion';

// GET /api/educacion/estudiantes - Listar estudiantes
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const curso_id = searchParams.get('curso_id');
    const estado = searchParams.get('estado');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const db = await getDb();
    
    let query = `
      SELECT e.*, c.nombre as curso_nombre
      FROM educacion_estudiantes e
      LEFT JOIN educacion_cursos c ON e.curso_id = c.id
      WHERE e.company_id = $1
    `;
    const params: any[] = [user.company_id];
    let paramCount = 1;

    if (curso_id) {
      paramCount++;
      query += ` AND e.curso_id = $${paramCount}`;
      params.push(curso_id);
    }

    if (estado) {
      paramCount++;
      query += ` AND e.estado = $${paramCount}`;
      params.push(estado);
    }

    if (search) {
      paramCount++;
      query += ` AND (e.nombres ILIKE $${paramCount} OR e.apellido_paterno ILIKE $${paramCount} OR e.rut ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Contar total
    const countQuery = `SELECT COUNT(*) FROM (${query}) as subquery`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Paginación
    query += ` ORDER BY e.apellido_paterno, e.nombres LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return NextResponse.json({
      data: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching estudiantes:', error);
    return NextResponse.json({ error: 'Error al obtener estudiantes' }, { status: 500 });
  }
}

// POST /api/educacion/estudiantes - Crear estudiante
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: EstudianteCreate = await request.json();

    // Validaciones
    if (!body.rut || !body.nombres || !body.apellido_paterno || !body.fecha_nacimiento) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    // Verificar RUT duplicado
    const existing = await db.query(
      'SELECT id FROM educacion_estudiantes WHERE rut = $1 AND company_id = $2',
      [body.rut, user.company_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Ya existe un estudiante con este RUT' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO educacion_estudiantes 
       (company_id, rut, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, direccion, telefono, email, curso_id, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        user.company_id,
        body.rut,
        body.nombres,
        body.apellido_paterno,
        body.apellido_materno || null,
        body.fecha_nacimiento,
        body.genero || null,
        body.direccion || null,
        body.telefono || null,
        body.email || null,
        body.curso_id || null,
        body.observaciones || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating estudiante:', error);
    return NextResponse.json({ error: 'Error al crear estudiante' }, { status: 500 });
  }
}
