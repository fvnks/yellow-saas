/**
 * Cookies de sesión de los portales (apoderados y profesores).
 *
 * Vive en un solo archivo para que el login unificado, el login propio del
 * portal y el logout no diverjan en nombre de cookie, duración ni flags.
 * La duración debe ir siempre de la mano del `exp` del JWT, que firma el
 * backend con el mismo flag `recordar` (8h o 30 días).
 */

export type TipoPortal = 'apoderado' | 'profesor';

const COOKIES: Record<TipoPortal, string> = {
  apoderado: 'portal_token',
  profesor: 'portal_profesor_token',
};

/** Duraciones de sesión: visita corta (8h) o sesión recordada (30 días). */
export const DURACION_SESION = {
  corta: 8 * 60 * 60,
  recordada: 30 * 24 * 60 * 60,
} as const;

/** Nombre de la cookie de un portal. */
export function cookiePortal(tipo: TipoPortal): string {
  return COOKIES[tipo];
}

/**
 * Fija la cookie de sesión del portal. `recordar` decide 30 días o 8h;
 * en HTTPS se agrega `Secure` (en http://localhost no, para poder desarrollar).
 */
export function fijarSesionPortal(token: string, tipo: TipoPortal, recordar: boolean): void {
  const maxAge = recordar ? DURACION_SESION.recordada : DURACION_SESION.corta;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIES[tipo]}=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

/** Borra la cookie de sesión de un portal (logout). */
export function limpiarSesionPortal(tipo: TipoPortal): void {
  document.cookie = `${COOKIES[tipo]}=; path=/; max-age=0; SameSite=Lax`;
}
