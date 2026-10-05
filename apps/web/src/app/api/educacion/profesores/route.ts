import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { ProfesorCreate, ProfesorUpdate } from '@/types/educacion';

// GET /api/educacion/profesores - Listar profesores
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const search = searchParams.get('search');

    const db = await getDb();
    
    let query = `
      SELECT p.*,
             (SELECT COUNT(*) FROM educacion_cursos c WHERE c.profesor_jefe_id = p.id) as cursos_jefe,
             (SELECT COUNT(*) FROM educacion_curso_asignatura ca WHERE ca.profesor_id = p.id) as asignaturas
      FROM educacion_profesores p
      WHERE p.company_id = $1
    `;
    const params: any[] = [user.company_id];

    if (estado) {
      query += ` AND p.estado = $${params.length + 1}`;
      params.push(estado);
    }

    if (search) {
      query += ` AND (p.nombres ILIKE $${params.length + 1} OR p.apellido_paterno ILIKE $${params.length + 1} OR p.rut ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY p.apellido_paterno, p.nombres`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching profesores:', error);
    return NextResponse.json({ error: 'Error al obtener profesores' }, { status: 500 });
  }
}

// POST /api/educacion/profesores - Crear profesor
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: ProfesorCreate = await request.json();

    if (!body.rut || !body.nombres || !body.apellido_paterno) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    // Verificar RUT duplicado
    const existing = await db.query(
      'SELECT id FROM educacion_profesores WHERE rut = $1 AND company_id = $2',
      [body.rut, user.company_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Ya existe un profesor con este RUT' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO educacion_profesores 
       (company_id, rut, nombres, apellido_paterno, apellido_materno, email, telefono, especialidad, titulo, fecha_ingreso)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        user.company_id,
        body.rut,
        body.nombres,
        body.apellido_paterno,
        body.apellido_materno || null,
        body.email || null,
        body.telefono || null,
        body.especialidad || null,
        body.titulo || null,
        body.fecha_ingreso || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating profesor:', error);
    return NextResponse.json({ error: 'Error al crear profesor' }, { status: 500 });
  }
}
