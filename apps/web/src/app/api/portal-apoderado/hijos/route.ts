import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPortalAuth } from '@/api/portal-apoderado/lib/auth';
import {
  validarHijo,
  normalizarRut,
  normalizarHijo,
  mismoDia,
  MAX_HIJOS,
} from '@/lib/educacion/portal-registration';

const COMPANY_ID_DEFECTO = '135e7b20-adc4-43d2-a5b8-822521865f47';

class ErrorPortal extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function esDuplicado(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && (error as { code?: string }).code === '23505');
}

/** GET: los hijos del apoderado autenticado, y solo los suyos. */
export async function GET(request: NextRequest) {
  try {
    const sesion = await verifyPortalAuth(request);
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const db = await getDb();
    const result = await db.query(
      `SELECT e.id, e.rut, e.nombres, e.apellido_paterno, e.apellido_materno,
              e.fecha_nacimiento::text AS fecha_nacimiento,
              e.telefono, c.nombre AS curso_nombre,
              ea.tipo AS tipo_vinculo, ea.es_apoderado_principal
         FROM educacion_estudiante_apoderado ea
         JOIN educacion_estudiantes e ON e.id = ea.estudiante_id
         LEFT JOIN educacion_cursos c ON c.id = e.curso_id
        WHERE ea.apoderado_id = $1
        ORDER BY e.apellido_paterno, e.nombres`,
      [sesion.id]
    );

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error listando hijos:', error);
    return NextResponse.json({ error: 'Error al obtener los hijos' }, { status: 500 });
  }
}

/**
 * POST: agrega un hijo. Mismas reglas que el registro público: debe estar
 * matriculado, coincidir RUT + fecha de nacimiento y no tener otro apoderado.
 */
export async function POST(request: NextRequest) {
  try {
    const sesion = await verifyPortalAuth(request);
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 });
    }

    const errores = validarHijo(body as never);
    if (errores.length > 0) {
      return NextResponse.json({ error: errores[0], errores }, { status: 400 });
    }

    const hijo = normalizarHijo(body as never);
    const db = await getDb();

    const actuales = await db.query(
      'SELECT count(*) AS total FROM educacion_estudiante_apoderado WHERE apoderado_id = $1',
      [sesion.id]
    );
    if (Number(actuales.rows[0].total) >= MAX_HIJOS) {
      return NextResponse.json(
        { error: `Puedes tener hasta ${MAX_HIJOS} hijos en tu cuenta.` },
        { status: 400 }
      );
    }

    const busqueda = await db.query(
      `SELECT e.id, e.nombres, e.apellido_paterno, e.apellido_materno, e.rut,
              e.fecha_nacimiento::text AS fecha_nacimiento_iso,
              c.nombre AS curso_nombre
         FROM educacion_estudiantes e
         LEFT JOIN educacion_cursos c ON c.id = e.curso_id
        WHERE e.rut = $1 AND e.company_id = $2`,
      [hijo.rut, COMPANY_ID_DEFECTO]
    );

    if (busqueda.rows.length === 0) {
      return NextResponse.json(
        {
          error:
            `El estudiante con RUT ${hijo.rut} no está matriculado en el establecimiento. ` +
            'Contacta al colegio para matricularlo y luego vuelve a intentarlo.',
        },
        { status: 400 }
      );
    }

    const estudiante = busqueda.rows[0];

    if (!mismoDia(hijo.fecha_nacimiento, estudiante.fecha_nacimiento_iso)) {
      return NextResponse.json(
        {
          error:
            `No pudimos verificar a ${estudiante.nombres} ${estudiante.apellido_paterno}: ` +
            'la fecha de nacimiento no coincide con la ficha del colegio.',
        },
        { status: 400 }
      );
    }

    try {
      await db.query(
        `INSERT INTO educacion_estudiante_apoderado (estudiante_id, apoderado_id, tipo, es_apoderado_principal)
         VALUES ($1, $2, $3, NOT EXISTS (
           SELECT 1 FROM educacion_estudiante_apoderado WHERE apoderado_id = $2
         ))`,
        [estudiante.id, sesion.id, hijo.tipo]
      );
    } catch (error) {
      if (esDuplicado(error)) {
        return NextResponse.json(
          {
            error:
              `${estudiante.nombres} ${estudiante.apellido_paterno} ya tiene un apoderado registrado ` +
              'en el portal.',
          },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      {
        data: {
          id: estudiante.id,
          rut: estudiante.rut,
          nombres: estudiante.nombres,
          apellido_paterno: estudiante.apellido_paterno,
          apellido_materno: estudiante.apellido_materno,
          curso_nombre: estudiante.curso_nombre,
          tipo_vinculo: hijo.tipo,
        },
        message: 'Hijo agregado correctamente',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ErrorPortal) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error agregando hijo:', error);
    return NextResponse.json({ error: 'Error al agregar el hijo' }, { status: 500 });
  }
}
