'use client';

import { useEffect } from 'react';
import { clearAuthToken, hasAuthToken } from '@/lib/auth-token';

/**
 * Un 401 de cualquier API significa que el token que tiene el navegador ya no
 * lo acepta el servidor: caducó (`exp` son 7 días) o se firmó con un
 * JWT_SECRET que ya no es el vigente. El cliente no verifica la firma ni el
 * `exp` (`parseJwtPayload` es solo lectura), así que la UI sigue pareciendo
 * logueada y todas las llamadas fallan en silencio: el panel queda vacío sin
 * ningún error visible.
 *
 * Este watcher intercepta `fetch`, limpia la sesión y lleva a /login con un
 * aviso, en lugar de dejar la pantalla en blanco.
 *
 * Se instala una sola vez (bandera en window) aunque varios layouts lo monten.
 */

// Rutas donde un 401 es esperado o pertenece a otro flujo (portal del apoderado
// usa su propio token) y no debe cerrar la sesión de la empresa.
const SKIP_PREFIXES = ['/login', '/register', '/auth/', '/api/auth/', '/portal-apoderado', '/api/portal-apoderado'];

function shouldSkip(url: string): boolean {
  try {
    const path = new URL(url, window.location.origin).pathname;
    return SKIP_PREFIXES.some((p) => path.startsWith(p));
  } catch {
    return true;
  }
}

export function AuthWatcher() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const w = window as Window & { __yellowAuthWatcher?: boolean };
    if (w.__yellowAuthWatcher) return;
    w.__yellowAuthWatcher = true;

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const response = await originalFetch(input, init);

      try {
        if (
          response.status === 401 &&
          hasAuthToken() &&
          !shouldSkip(window.location.pathname) &&
          !shouldSkip(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url)
        ) {
          clearAuthToken();
          const redirect = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?redirect=${redirect}&session=expired`;
        }
      } catch {
        // Nunca romper la llamada original por el manejo del 401.
      }

      return response;
    };
  }, []);

  return null;
}
