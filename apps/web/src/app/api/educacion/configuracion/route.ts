import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/educacion/configuracion - Leer la configuración de la empresa
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const db = await getDb();
    const result = await db.query(
      'SELECT datos, updated_at FROM educacion_configuracion WHERE company_id = $1',
      [user.company_id]
    );

    return NextResponse.json({
      data: {
        datos: result.rows[0]?.datos ?? {},
        updated_at: result.rows[0]?.updated_at ?? null,
      },
    });
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

// POST /api/educacion/configuracion - Guardar (upsert) la configuración
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const datos = await request.json();
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
      return NextResponse.json({ error: 'Se esperaba un objeto de configuración' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.query(
      `INSERT INTO educacion_configuracion (company_id, datos)
       VALUES ($1, $2)
       ON CONFLICT (company_id) DO UPDATE
         SET datos = EXCLUDED.datos,
             updated_at = NOW()
       RETURNING datos, updated_at`,
      [user.company_id, datos]
    );

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error guardando configuración:', error);
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 });
  }
}