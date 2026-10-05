import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { PensionCreate, PensionUpdate } from '@/types/educacion';

// GET /api/educacion/pensiones - Listar pensiones
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estudiante_id = searchParams.get('estudiante_id');
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio');
    const estado = searchParams.get('estado');

    const db = await getDb();
    
    let query = `
      SELECT p.*,
             e.nombres as estudiante_nombres,
             e.apellido_paterno as estudiante_apellido,
             e.rut as estudiante_rut,
             c.nombre as curso_nombre
      FROM educacion_pensiones p
      JOIN educacion_estudiantes e ON p.estudiante_id = e.id
      LEFT JOIN educacion_cursos c ON e.curso_id = c.id
      WHERE p.company_id = $1
    `;
    const params: any[] = [user.company_id];

    if (estudiante_id) {
      query += ` AND p.estudiante_id = $${params.length + 1}`;
      params.push(estudiante_id);
    }

    if (mes) {
      query += ` AND p.mes = $${params.length + 1}`;
      params.push(parseInt(mes));
    }

    if (anio) {
      query += ` AND p.anio = $${params.length + 1}`;
      params.push(parseInt(anio));
    }

    if (estado) {
      query += ` AND p.estado = $${params.length + 1}`;
      params.push(estado);
    }

    query += ` ORDER BY p.anio DESC, p.mes DESC, e.apellido_paterno`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching pensiones:', error);
    return NextResponse.json({ error: 'Error al obtener pensiones' }, { status: 500 });
  }
}

// POST /api/educacion/pensiones - Crear pension
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: PensionCreate = await request.json();

    if (!body.estudiante_id || !body.mes || !body.anio || !body.monto || !body.fecha_vencimiento) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.query(
      `INSERT INTO educacion_pensiones 
       (company_id, estudiante_id, mes, anio, monto, fecha_vencimiento)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (estudiante_id, mes, anio) DO NOTHING
       RETURNING *`,
      [
        user.company_id,
        body.estudiante_id,
        body.mes,
        body.anio,
        body.monto,
        body.fecha_vencimiento
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Ya existe una pension para este estudiante, mes y año' }, { status: 400 });
    }

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating pension:', error);
    return NextResponse.json({ error: 'Error al crear pension' }, { status: 500 });
  }
}
