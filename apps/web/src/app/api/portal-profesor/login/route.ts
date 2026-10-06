import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { crearTokenPortalProfesor } from '@/api/portal-profesor/lib/auth';
import { compare } from 'bcryptjs';
import { timingSafeEqual } from 'crypto';

/**
 * Compara contra una contraseña guardada en texto plano.
 */
function compararTextoSeguro(almacenada: string, recibida: string): boolean {
  const a = Buffer.from(almacenada, 'utf8');
  const b = Buffer.from(recibida, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.query(
      `SELECT id, company_id, nombres, apellido_paterno, apellido_materno,
              email, telefono, password
       FROM educacion_profesores
       WHERE lower(email) = lower($1)
         AND estado = 'activo'`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const profesor = result.rows[0];

    const almacenada = typeof profesor.password === 'string' ? profesor.password : '';
    let passwordOk = false;

    if (almacenada.startsWith('$2')) {
      passwordOk = await compare(password, almacenada);
    } else if (almacenada.length > 0) {
      passwordOk = compararTextoSeguro(almacenada, String(password));
    }

    if (!passwordOk) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const token = await crearTokenPortalProfesor(profesor);

    return NextResponse.json({
      data: {
        token,
        profesor: {
          id: profesor.id,
          nombres: profesor.nombres,
          apellido_paterno: profesor.apellido_paterno,
          apellido_materno: profesor.apellido_materno,
          email: profesor.email,
          telefono: profesor.telefono,
        },
      },
    });
  } catch (error) {
    console.error('Error en login profesor:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
