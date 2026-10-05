/**
 * Reglas de validación del registro público del portal de apoderados.
 *
 * Todo lo que es "decisión de negocio" vive aquí, separado de las rutas de
 * API, para poder probarlo sin tocar la base de datos.
 *
 * Decisiones de diseño (acordadas con el cliente):
 *  - El hijo debe estar **matriculado previamente por el colegio**: el portal
 *    solo lo enlaza, nunca crea fichas de estudiantes nuevas.
 *  - Para enlazar se pide **RUT + fecha de nacimiento**, de modo que conocer
 *    solo el RUT de un niño no alcanza para reclamarlo.
 *  - Un niño no puede ser reclamado por dos apoderados distintos (también
 *    garantizado por el índice único `uq_educacion_estudiante_apoderado_estudiante`).
 */

export const TIPOS_VINCULO = ['padre', 'madre', 'tutor'] as const;
export type TipoVinculo = (typeof TIPOS_VINCULO)[number];

/** Máximo de hijos que un apoderado puede declarar en una sola operación. */
export const MAX_HIJOS = 10;

export interface ApoderadoInput {
  rut?: unknown;
  nombres?: unknown;
  apellido_paterno?: unknown;
  apellido_materno?: unknown;
  email?: unknown;
  password?: unknown;
  telefono?: unknown;
}

export interface HijoInput {
  rut?: unknown;
  fecha_nacimiento?: unknown;
  tipo?: unknown;
}

/**
 * Normaliza un RUT chileno: quita puntos y espacios, pasa a mayúsculas y
 * garantiza el guion (`1.111.111-1` → `11111111-1`). Si viene sin guion se
 * agrega, para que "111111111" y "11111111-1" sean el mismo valor.
 *
 * No valida el dígito verificador: los datos sembrados del colegio (y muchas
 * cargas manuales) no lo traen calculado, y un RUT con DV malo simplemente no
 * existirá en la tabla de estudiantes, por lo que el lookup ya lo rechaza.
 */
export function normalizarRut(valor: unknown): string {
  if (typeof valor !== 'string') return '';
  const limpio = valor.replace(/[.\s]/g, '').toUpperCase().trim();
  if (!limpio) return '';
  if (limpio.includes('-')) {
    const [cuerpo, dv] = limpio.split('-');
    return `${cuerpo}-${dv}`;
  }
  // Sin guion solo tiene sentido si el largo corresponde a cuerpo+DV
  // (8 o 9 caracteres). Cualquier otro largo se deja tal cual y lo rechaza
  // `esRutValido`.
  if (limpio.length === 8 || limpio.length === 9) {
    return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
  }
  return limpio;
}

/** Comprueba que el RUT normalizado tenga forma de RUT (cuerpo + DV). */
export function esRutValido(valor: unknown): boolean {
  const rut = normalizarRut(valor);
  return /^\d{1,8}-(?:\d{1}|K)$/.test(rut);
}

/** Comprueba que un texto sea una fecha `YYYY-MM-DD` real y no futura. */
export function esFechaNacimientoValida(valor: unknown): boolean {
  if (typeof valor !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
  if (!m) return false;

  const anio = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);

  if (anio < 1900 || mes < 1 || mes > 12 || dia < 1) return false;

  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  // Date.UTC normaliza meses inválidos (31 de febrero → 2 de marzo),
  // así que verificamos que las componentes no se hayan desplazado.
  if (fecha.getUTCFullYear() !== anio || fecha.getUTCMonth() !== mes - 1 || fecha.getUTCDate() !== dia) {
    return false;
  }

  return fecha.getTime() <= Date.now();
}

/** Devuelve `valor` como `YYYY-MM-DD` (acepta string o Date). */
export function aIsoDate(valor: unknown): string {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return valor.toISOString().slice(0, 10);
  }
  if (typeof valor === 'string') {
    const m = /^(\d{4}-\d{2}-\d{2})/.exec(valor.trim());
    if (m) return m[1];
    const d = new Date(valor);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return '';
}

/** Compara dos fechas solo por el día, ignorando huso horario y hora. */
export function mismoDia(a: unknown, b: unknown): boolean {
  const izq = aIsoDate(a);
  const der = aIsoDate(b);
  return izq !== '' && der !== '' && izq === der;
}

function soloTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

/** Valida los datos del apoderado. Devuelve la lista de errores (vacía = OK). */
export function validarApoderado(entrada: ApoderadoInput): string[] {
  const errores: string[] = [];

  if (!esRutValido(entrada.rut)) errores.push('El RUT del apoderado no es válido (formato 12345678-9).');

  const nombres = soloTexto(entrada.nombres);
  if (nombres.length < 2) errores.push('Ingresa tus nombres.');
  else if (nombres.length > 100) errores.push('Los nombres no pueden superar los 100 caracteres.');

  const apellido = soloTexto(entrada.apellido_paterno);
  if (apellido.length < 2) errores.push('Ingresa tu apellido paterno.');
  else if (apellido.length > 100) errores.push('El apellido no puede superar los 100 caracteres.');

  const email = soloTexto(entrada.email);
  if (email.length === 0) errores.push('Ingresa tu email.');
  else if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errores.push('El email no tiene un formato válido.');
  }

  const password = typeof entrada.password === 'string' ? entrada.password : '';
  if (password.length < 8) errores.push('La contraseña debe tener al menos 8 caracteres.');
  else if (password.length > 200) errores.push('La contraseña es demasiado larga.');

  const telefono = soloTexto(entrada.telefono);
  if (telefono && !/^[+0-9()\s-]{6,20}$/.test(telefono)) {
    errores.push('El teléfono no tiene un formato válido.');
  }

  return errores;
}

/** Valida un hijo a enlazar. Devuelve la lista de errores (vacía = OK). */
export function validarHijo(entrada: HijoInput): string[] {
  const errores: string[] = [];

  if (!esRutValido(entrada.rut)) errores.push('El RUT del hijo no es válido (formato 12345678-9).');
  if (!esFechaNacimientoValida(entrada.fecha_nacimiento)) {
    errores.push('La fecha de nacimiento del hijo no es válida.');
  }

  const tipo = entrada.tipo == null || entrada.tipo === '' ? 'padre' : String(entrada.tipo);
  if (!(TIPOS_VINCULO as readonly string[]).includes(tipo)) {
    errores.push('El vínculo debe ser padre, madre o tutor.');
  }

  return errores;
}

/** Normaliza un hijo ya validado (RUT normalizado y vínculo con default). */
export function normalizarHijo(entrada: HijoInput) {
  return {
    rut: normalizarRut(entrada.rut),
    fecha_nacimiento: String(entrada.fecha_nacimiento ?? '').trim(),
    tipo: (entrada.tipo == null || entrada.tipo === '' ? 'padre' : String(entrada.tipo)) as TipoVinculo,
  };
}

/**
 * Valida la lista completa de hijos de un registro: cantidad, datos de cada
 * uno y que no haya el mismo niño declarado dos veces.
 */
export function validarListaHijos(hijos: unknown): string[] {
  if (!Array.isArray(hijos) || hijos.length === 0) {
    return ['Debes registrar al menos un hijo.'];
  }
  if (hijos.length > MAX_HIJOS) {
    return [`Puedes registrar hasta ${MAX_HIJOS} hijos por operación.`];
  }

  const errores: string[] = [];
  const vistos = new Set<string>();

  hijos.forEach((hijo, indice) => {
    const erroresHijo = validarHijo(hijo as HijoInput);
    if (erroresHijo.length > 0) {
      errores.push(`Hijo ${indice + 1}: ${erroresHijo[0]}`);
      return;
    }

    const rut = normalizarRut((hijo as HijoInput).rut);
    if (vistos.has(rut)) {
      errores.push(`Hijo ${indice + 1}: el RUT ${rut} está repetido en tu lista.`);
      return;
    }
    vistos.add(rut);
  });

  return errores;
}
