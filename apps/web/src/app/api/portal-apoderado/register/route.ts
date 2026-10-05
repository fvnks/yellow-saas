import { NextRequest, NextResponse } from 'next/server';
import type { PoolClient } from 'pg';
import { getDb, transaction } from '@/lib/db';
import { hash } from 'bcryptjs';
import { crearTokenPortal } from '@/api/portal-apoderado/lib/auth';
import {
  validarApoderado,
  validarListaHijos,
  normalizarRut,
  normalizarHijo,
  mismoDia,
} from '@/lib/educacion/portal-registration';

/**
 * El portal es público y no recibe contexto de empresa, así que el alta se
 * hace contra el establecimiento por defecto (mismo criterio que el registro
 * original del módulo).
 */
const COMPANY_ID_DEFECTO = '135e7b20-adc4-43d2-a5b8-822521865f47';

/** Error de negocio: se responde con su estado (400) y se revierte la tx. */
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 });
    }

    const { hijos, ...datosApoderado } = body as Record<string, unknown>;

    const erroresApoderado = validarApoderado(datosApoderado);
    if (erroresApoderado.length > 0) {
      return NextResponse.json({ error: erroresApoderado[0], errores: erroresApoderado }, { status: 400 });
    }

    const erroresHijos = validarListaHijos(hijos);
    if (erroresHijos.length > 0) {
      return NextResponse.json({ error: erroresHijos[0], errores: erroresHijos }, { status: 400 });
    }

    const hijosNormalizados = (hijos as unknown[]).map((h) => normalizarHijo(h as never));
    const rutApoderado = normalizarRut(datosApoderado.rut);
    const email = String(datosApoderado.email).trim();

    const db = await getDb();

    // El índice único de email es la red de seguridad; esto da un mensaje claro.
    const emailExistente = await db.query(
      'SELECT 1 FROM educacion_apoderados WHERE lower(email) = lower($1)',
      [email]
    );
    if (emailExistente.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email. Inicia sesión o recupera tu contraseña.' },
        { status: 400 }
      );
    }

    const passwordHasheada = await hash(String(datosApoderado.password), 10);

    const { apoderado, pupilos } = await transaction(async (client: PoolClient) => {
      let apoderado;
      try {
        const creado = await client.query(
          `INSERT INTO educacion_apoderados
             (company_id, rut, nombres, apellido_paterno, apellido_materno, email, telefono, password)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, rut, nombres, apellido_paterno, apellido_materno, email, telefono, company_id`,
          [
            COMPANY_ID_DEFECTO,
            rutApoderado,
            String(datosApoderado.nombres).trim(),
            String(datosApoderado.apellido_paterno).trim(),
            datosApoderado.apellido_materno ? String(datosApoderado.apellido_materno).trim() : null,
            email,
            datosApoderado.telefono ? String(datosApoderado.telefono).trim() : null,
            passwordHasheada,
          ]
        );
        apoderado = creado.rows[0];
      } catch (error) {
        if (esDuplicado(error)) {
          const constraint = (error as { constraint?: string }).constraint || '';
          throw new ErrorPortal(
            constraint.includes('rut')
              ? 'Ya existe un apoderado registrado con ese RUT.'
              : 'Ya existe una cuenta con este email.'
          );
        }
        throw error;
      }

      const pupilos: Array<Record<string, unknown>> = [];

      for (const hijo of hijosNormalizados) {
        // 1) El hijo debe estar matriculado: el portal no crea estudiantes.
        const busqueda = await client.query(
          `SELECT e.id, e.nombres, e.apellido_paterno, e.apellido_materno, e.rut,
                  e.fecha_nacimiento::text AS fecha_nacimiento_iso,
                  c.nombre AS curso_nombre
             FROM educacion_estudiantes e
             LEFT JOIN educacion_cursos c ON c.id = e.curso_id
            WHERE e.rut = $1 AND e.company_id = $2`,
          [hijo.rut, COMPANY_ID_DEFECTO]
        );

        if (busqueda.rows.length === 0) {
          throw new ErrorPortal(
            `El estudiante con RUT ${hijo.rut} no está matriculado en el establecimiento. ` +
              'Contacta al colegio para matricularlo y luego vuelve a intentarlo.'
          );
        }

        const estudiante = busqueda.rows[0];

        // 2) Verificación de identidad: RUT + fecha de nacimiento.
        if (!mismoDia(hijo.fecha_nacimiento, estudiante.fecha_nacimiento_iso)) {
          throw new ErrorPortal(
            `No pudimos verificar a ${estudiante.nombres} ${estudiante.apellido_paterno}: ` +
              'la fecha de nacimiento no coincide con la ficha del colegio.'
          );
        }

        // 3) Un hijo solo puede tener un apoderado en el portal.
        const vinculos = await client.query(
          'SELECT apoderado_id FROM educacion_estudiante_apoderado WHERE estudiante_id = $1',
          [estudiante.id]
        );
        if (vinculos.rows.length > 0) {
          throw new ErrorPortal(
            `${estudiante.nombres} ${estudiante.apellido_paterno} ya tiene un apoderado registrado. ` +
              'Si eres tú, inicia sesión con tu cuenta; si no, contacta al colegio.'
          );
        }

        try {
          await client.query(
            `INSERT INTO educacion_estudiante_apoderado
               (estudiante_id, apoderado_id, tipo, es_apoderado_principal)
             VALUES ($1, $2, $3, true)`,
            [estudiante.id, apoderado.id, hijo.tipo]
          );
        } catch (error) {
          if (esDuplicado(error)) {
            throw new ErrorPortal(
              `${estudiante.nombres} ${estudiante.apellido_paterno} acaba de ser registrado por otro apoderado.`
            );
          }
          throw error;
        }

        pupilos.push({
          id: estudiante.id,
          nombres: estudiante.nombres,
          apellido_paterno: estudiante.apellido_paterno,
          apellido_materno: estudiante.apellido_materno,
          rut: estudiante.rut,
          curso_nombre: estudiante.curso_nombre,
          tipo_vinculo: hijo.tipo,
        });
      }

      return { apoderado, pupilos };
    }, COMPANY_ID_DEFECTO);

    const token = await crearTokenPortal(apoderado);

    return NextResponse.json(
      {
        data: {
          token,
          apoderado: {
            id: apoderado.id,
            rut: apoderado.rut,
            nombres: apoderado.nombres,
            apellido_paterno: apoderado.apellido_paterno,
            apellido_materno: apoderado.apellido_materno,
            email: apoderado.email,
            telefono: apoderado.telefono,
            pupilos,
          },
        },
        message: 'Apoderado registrado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ErrorPortal) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error en registro:', error);
    return NextResponse.json({ error: 'Error al registrar apoderado' }, { status: 500 });
  }
}
