import { esRutValido, normalizarRut } from '@/lib/educacion/portal-registration';

/**
 * Resolución del campo de usuario del login unificado.
 *
 * En el portal el apoderado puede escribir su correo, su RUT o su
 * "nombre y apellido" —comodidad pedida en el diseño del portal—, así que
 * aquí se clasifica la entrada y se decide si un candidato coincide con lo
 * que escribió. Las funciones son puras para poder testearlas sin tocar la BD.
 */

export type TipoIdentificador = 'email' | 'rut' | 'nombre';

/** Clasifica lo escrito por el usuario. */
export function clasificarIdentificador(valor: unknown): TipoIdentificador {
  const v = String(valor ?? '').trim();
  if (v.includes('@')) return 'email';
  // Un RUT sin DV válido (ej. "12345678") no puede ser correo ni nombre de
  // persona chilena, pero tampoco se fuerza: esRutValido decide la forma.
  if (esRutValido(v)) return 'rut';
  return 'nombre';
}

/**
 * Texto comparable sin acentos ni puntuación: "María José González-López"
 * → "maria jose gonzalez lopez". Usa NFD (mismo criterio que el SQL, que
 * traduce los acentos con `translate()` para no depender de `unaccent`).
 */
export function normalizarNombre(valor: unknown): string {
  return String(valor ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * ¿El "nombre y apellido" escrito coincide con la ficha del registro?
 *
 * Se exige que **todos** los tokens escritos aparezcan en el nombre
 * completo (el orden no importa): "maria gonzalez" y "gonzalez maria"
 * coinciden con "María José González López" —también "maria lopez", que es
 * nombres + apellido materno—, pero "maria perez" no, porque "perez" no
 * está en la ficha.
 */
export function coincideNombreCompleto(
  entrada: unknown,
  nombres: unknown,
  apellidoPaterno: unknown,
  apellidoMaterno?: unknown
): boolean {
  const tokensEntrada = normalizarNombre(entrada).split(' ').filter(Boolean);
  if (tokensEntrada.length === 0) return false;

  const tokensRegistro = normalizarNombre(
    `${String(nombres ?? '')} ${String(apellidoPaterno ?? '')} ${String(apellidoMaterno ?? '')}`
  )
    .split(' ')
    .filter(Boolean);

  return tokensEntrada.every((token) => tokensRegistro.includes(token));
}

/**
 * Último token escrito —normalmente el apellido paterno—. Es el que se usa
 * para buscar candidatos en la BD (el filtrado fino con todos los tokens se
 * hace después, en memoria, sobre el resultado acotado).
 */
export function tokenBusquedaNombre(entrada: unknown): string {
  const tokens = normalizarNombre(entrada).split(' ').filter(Boolean);
  return tokens[tokens.length - 1] ?? '';
}

/**
 * Clave de bloqueo por intentos fallidos: estable aunque el usuario cambie
 * entre correo, RUT y nombre para la misma cuenta.
 */
export function claveIntentos(tipo: TipoIdentificador, valor: unknown): string {
  const v = String(valor ?? '');
  switch (tipo) {
    case 'email':
      return `email:${v.trim().toLowerCase()}`;
    case 'rut':
      return `rut:${normalizarRut(v)}`;
    default:
      return `nombre:${normalizarNombre(v)}`;
  }
}
