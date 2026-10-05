import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { AsistenciaCreate, AsistenciaUpdate } from '@/types/educacion';

// GET /api/educacion/asistencia - Listar asistencia
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const curso_id = searchParams.get('curso_id');
    const fecha = searchParams.get('fecha');
    const estado = searchParams.get('estado');

    const db = await getDb();
    
    let query = `
      SELECT a.*, 
             e.nombres as estudiante_nombres, 
             e.apellido_paterno as estudiante_apellido,
             e.rut as estudiante_rut,
             c.nombre as curso_nombre
      FROM educacion_asistencia a
      JOIN educacion_estudiantes e ON a.estudiante_id = e.id
      JOIN educacion_cursos c ON a.curso_id = c.id
      WHERE a.company_id = $1
    `;
    const params: any[] = [user.company_id];

    if (curso_id) {
      query += ` AND a.curso_id = $${params.length + 1}`;
      params.push(curso_id);
    }

    if (fecha) {
      query += ` AND a.fecha = $${params.length + 1}`;
      params.push(fecha);
    }

    if (estado) {
      query += ` AND a.estado = $${params.length + 1}`;
      params.push(estado);
    }

    query += ` ORDER BY a.fecha DESC, e.apellido_paterno, e.nombres`;

    const result = await db.query(query, params);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching asistencia:', error);
    return NextResponse.json({ error: 'Error al obtener asistencia' }, { status: 500 });
  }
}

// POST /api/educacion/asistencia - Registrar asistencia (individual o masiva)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const db = await getDb();

    // Si es registro masivo
    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        const result = await db.query(
          `INSERT INTO educacion_asistencia 
           (company_id, estudiante_id, curso_id, fecha, estado, justificacion)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (estudiante_id, fecha) 
           DO UPDATE SET estado = $5, justificacion = $6
           RETURNING *`,
          [
            user.company_id,
            item.estudiante_id,
            item.curso_id,
            item.fecha,
            item.estado,
            item.justificacion || null
          ]
        );
        results.push(result.rows[0]);
      }
      return NextResponse.json({ data: results }, { status: 201 });
    }

    // Registro individual
    const item: AsistenciaCreate = body;
    
    if (!item.estudiante_id || !item.curso_id || !item.fecha || !item.estado) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO educacion_asistencia 
       (company_id, estudiante_id, curso_id, fecha, estado, justificacion)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (estudiante_id, fecha) 
       DO UPDATE SET estado = $5, justificacion = $6
       RETURNING *`,
      [
        user.company_id,
        item.estudiante_id,
        item.curso_id,
        item.fecha,
        item.estado,
        item.justificacion || null
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating asistencia:', error);
    return NextResponse.json({ error: 'Error al registrar asistencia' }, { status: 500 });
  }
}
