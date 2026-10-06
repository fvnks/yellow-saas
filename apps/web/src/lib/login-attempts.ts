/**
 * Bloqueo temporal de cuentas tras intentos fallidos de login.
 *
 * Complementa el rate limit por IP del middleware: si alguien reparte los
 * intentos entre varias IPs, la cuenta sigue bloqueada. En memoria, igual
 * que `lib/rate-limiter` — esta app corre como un único servidor Next.
 */

const FALLOS_MAX = 8;
const VENTANA_SEGUNDOS = 15 * 60;
const BLOQUEO_SEGUNDOS = 15 * 60;

interface Estado {
  fallos: number;
  ventanaExpira: number;
  bloqueoExpira: number;
}

const estados = new Map<string, Estado>();

/** Segundos que faltan para poder volver a intentar (0 = desbloqueada). */
export function segundosDeBloqueo(clave: string): number {
  const estado = estados.get(clave);
  if (!estado) return 0;

  const ahora = Date.now();
  if (estado.bloqueoExpira > ahora) {
    return Math.ceil((estado.bloqueoExpira - ahora) / 1000);
  }
  if (estado.ventanaExpira <= ahora) {
    estados.delete(clave);
  }
  return 0;
}

/** Registra un intento fallido y bloquea la cuenta al llegar al límite. */
export function registrarFallo(clave: string): void {
  const ahora = Date.now();
  const estado = estados.get(clave);

  if (!estado || estado.ventanaExpira <= ahora) {
    estados.set(clave, {
      fallos: 1,
      ventanaExpira: ahora + VENTANA_SEGUNDOS * 1000,
      bloqueoExpira: 0,
    });
    return;
  }

  estado.fallos += 1;
  if (estado.fallos >= FALLOS_MAX) {
    estado.bloqueoExpira = ahora + BLOQUEO_SEGUNDOS * 1000;
  }
}

/** Borra los intentos tras un login exitoso. */
export function limpiarIntentos(clave: string): void {
  estados.delete(clave);
}

/** Limpieza periódica de estados vencidos (no mantiene el proceso vivo). */
const limpieza = setInterval(
  () => {
    const ahora = Date.now();
    for (const [clave, estado] of estados) {
      if (estado.ventanaExpira <= ahora && estado.bloqueoExpira <= ahora) {
        estados.delete(clave);
      }
    }
  },
  5 * 60 * 1000
);
limpieza.unref?.();
