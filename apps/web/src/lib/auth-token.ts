/**
 * Helper centralizado para el token de autenticación.
 *
 * El token vive en DOS lugares sincronizados:
 * - Cookie `auth-token` (path=/, SameSite=Lax): la lee el middleware
 *   de Next.js en el servidor para proteger rutas.
 * - localStorage `auth-token`: lo lee el código cliente para llamar
 *   a las APIs con el header Authorization.
 *
 * NOTA: `httpOnly` NO se puede establecer desde JavaScript
 * (el navegador lo ignora), por eso la cookie se maneja desde aquí
 * y el middleware la valida en cada request.
 */

const TOKEN_KEY = 'auth-token';

function readCookieToken(): string | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  const found = document.cookie
    .split(';')
    .find((c) => c.trim().startsWith(`${TOKEN_KEY}=`));
  return found ? found.split('=')[1] || null : null;
}

function writeCookieToken(token: string, maxAgeSeconds?: number): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const isSecure = window.location.protocol === 'https:';
  const maxAge = typeof maxAgeSeconds === 'number' ? `; max-age=${maxAgeSeconds}` : '';
  document.cookie =
    `${TOKEN_KEY}=${token}; path=/${maxAge};${isSecure ? ' secure;' : ''} SameSite=Lax`;
}

function deleteCookieToken(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Obtiene el token: primero localStorage, con fallback a la cookie.
 * Retorna null si no existe en ninguno.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) ?? readCookieToken();
}

/**
 * Guarda el token en localStorage Y en la cookie (sincronizados).
 * Si no se indica maxAgeSeconds, la cookie es de sesión.
 */
export function setAuthToken(token: string, maxAgeSeconds?: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  writeCookieToken(token, maxAgeSeconds);
}

/**
 * Elimina el token de localStorage Y de la cookie.
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  deleteCookieToken();
}

/**
 * Verifica si existe un token de autenticación.
 */
export function hasAuthToken(): boolean {
  return getAuthToken() !== null;
}

/**
 * Obtiene los headers de autenticación para fetch.
 * Retorna un objeto vacío si no hay token.
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
