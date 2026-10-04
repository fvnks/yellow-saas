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
 * Decodifica el payload de un JWT (base64url) sin verificar
 * la firma — solo para lectura cliente (role, exp, company_id).
 * `atob` no acepta los caracteres base64url (- y _), por lo
 * que hay que normalizar a base64 estándar antes de decodificar.
 */
export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Reescribe la cookie `auth-token` cuando localStorage tiene un token
 * pero la cookie está ausente o desincronizada (por ejemplo, si se
 * borraron las cookies del navegador o expiró una cookie de otro flujo).
 * localStorage es la fuente de verdad; la cookie se deriva de ella.
 *
 * El maxAge se calcula del propio JWT (`exp`) para que la cookie
 * expire junto con el token, sin acortar sesiones "recordarme".
 * Retorna true si reescribió la cookie.
 */
export function syncAuthCookie(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(TOKEN_KEY);
  if (!stored) return false;
  if (readCookieToken() === stored) return false;

  let maxAge: number | undefined;
  const payload = parseJwtPayload(stored);
  const exp = typeof payload?.exp === 'number' ? payload.exp : undefined;
  if (exp !== undefined) {
    const remaining = exp - Math.floor(Date.now() / 1000);
    if (remaining > 0) maxAge = remaining;
  }

  writeCookieToken(stored, maxAge);
  return true;
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
