import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { crearTokenPortal } from '@/api/portal-apoderado/lib/auth';
import { compare } from 'bcryptjs';
import { timingSafeEqual } from 'crypto';

/**
 * Compara contra una contraseña guardada en texto plano (datos sembrados
 * antiguos que nunca pasaron por bcrypt). Se hace en tiempo constante para no
 * filtrar el largo por timing.
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

    // Buscar apoderado por email y traer sus pupilos en un solo paso.
    // El FILTER/COALESCE evita que un apoderado sin hijos reciba un objeto
    // fantasma con todos los campos en null.
    const result = await db.query(
      `SELECT a.id, a.company_id, a.nombres, a.apellido_paterno, a.apellido_materno,
              a.email, a.telefono, a.password,
              COALESCE((
                SELECT json_agg(json_build_object(
                         'id', e.id,
                         'nombres', e.nombres,
                         'apellido_paterno', e.apellido_paterno,
                         'apellido_materno', e.apellido_materno,
                         'rut', e.rut,
                         'curso_nombre', c.nombre
                       ) ORDER BY e.apellido_paterno)
                FROM educacion_estudiante_apoderado ea
                JOIN educacion_estudiantes e ON e.id = ea.estudiante_id
                LEFT JOIN educacion_cursos c ON e.curso_id = c.id
                WHERE ea.apoderado_id = a.id
              ), '[]'::json) AS pupilos
       FROM educacion_apoderados a
       WHERE lower(a.email) = lower($1)`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const apoderado = result.rows[0];

    const almacenada = typeof apoderado.password === 'string' ? apoderado.password : '';
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

    // Generar token JWT del portal (8h)
    const token = await crearTokenPortal(apoderado);

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
