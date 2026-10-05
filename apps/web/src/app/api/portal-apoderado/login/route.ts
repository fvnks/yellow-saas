import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    // Buscar apoderado por email
    const result = await db.query(
      `SELECT a.*, 
              array_agg(json_build_object(
                'id', e.id,
                'nombres', e.nombres,
                'apellido_paterno', e.apellido_paterno,
                'apellido_materno', e.apellido_materno,
                'rut', e.rut,
                'curso_nombre', c.nombre
              )) as pupilos
       FROM educacion_apoderados a
       LEFT JOIN educacion_estudiante_apoderado ea ON a.id = ea.apoderado_id
       LEFT JOIN educacion_estudiantes e ON ea.estudiante_id = e.id
       LEFT JOIN educacion_cursos c ON e.curso_id = c.id
       WHERE a.email = $1
       GROUP BY a.id`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const apoderado = result.rows[0];

    // Verificar contraseña (en producción, usar bcrypt)
    // Por ahora, comparación directa (implementar bcrypt después)
    if (apoderado.password !== password) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      id: apoderado.id,
      email: apoderado.email,
      nombre: `${apoderado.nombres} ${apoderado.apellido_paterno}`,
      tipo: 'apoderado',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(secret);

    return NextResponse.json({
      data: {
        token,
        apoderado: {
          id: apoderado.id,
          nombres: apoderado.nombres,
          apellido_paterno: apoderado.apellido_paterno,
          apellido_materno: apoderado.apellido_materno,
          email: apoderado.email,
          telefono: apoderado.telefono,
          pupilos: apoderado.pupilos || [],
        },
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
