/**
 * Helper centralizado para acceder al token de autenticación.
 * 
 * NOTA: La cookie `auth-token` es httpOnly, por lo que no se puede acceder
 * desde JavaScript. Este helper usa localStorage como fallback para
 * aplicaciones que necesitan el token en el cliente.
 * 
 * Para APIs, se recomienda usar el middleware de Next.js que inyecta
 * el token en los headers automáticamente.
 */

const TOKEN_KEY = 'auth-token';

/**
 * Obtiene el token de autenticación desde localStorage.
 * Retorna null si no existe.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Establece el token de autenticación en localStorage.
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Elimina el token de autenticación de localStorage.
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
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
