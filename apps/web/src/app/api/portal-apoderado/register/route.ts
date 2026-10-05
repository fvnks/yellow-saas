import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nombres, apellido_paterno, apellido_materno, telefono, rut } = body;

    if (!email || !password || !nombres || !apellido_paterno) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Verificar si el email ya existe
    const existing = await db.query(
      'SELECT id FROM educacion_apoderados WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un apoderado con este email' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await hash(password, 10);

    // Crear apoderado
    const result = await db.query(
      `INSERT INTO educacion_apoderados 
       (company_id, rut, nombres, apellido_paterno, apellido_materno, email, telefono, password)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, nombres, apellido_paterno, email`,
      [
        '135e7b20-adc4-43d2-a5b8-822521865f47', // company_id por defecto
        rut || null,
        nombres,
        apellido_paterno,
        apellido_materno || null,
        email,
        telefono || null,
        hashedPassword,
      ]
    );

    return NextResponse.json({
      data: result.rows[0],
      message: 'Apoderado registrado exitosamente',
    }, { status: 201 });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar apoderado' },
      { status: 500 }
    );
  }
}
