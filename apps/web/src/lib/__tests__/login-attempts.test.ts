import { describe, it, expect } from 'vitest';
import { segundosDeBloqueo, registrarFallo, limpiarIntentos } from '../login-attempts';

describe('login-attempts (bloqueo por cuenta)', () => {
  it('una clave desconocida está desbloqueada', () => {
    expect(segundosDeBloqueo('email:ninguno@test.cl')).toBe(0);
  });

  it('bloquea al llegar a 8 fallos y se suelta al limpiar', () => {
    const clave = 'email:lock@test.cl';

    for (let i = 0; i < 7; i++) registrarFallo(clave);
    expect(segundosDeBloqueo(clave)).toBe(0);

    registrarFallo(clave); // 8º fallo
    expect(segundosDeBloqueo(clave)).toBeGreaterThan(0);
    expect(segundosDeBloqueo(clave)).toBeLessThanOrEqual(15 * 60);

    limpiarIntentos(clave);
    expect(segundosDeBloqueo(clave)).toBe(0);
  });

  it('los fallos de claves distintos no se mezclan', () => {
    registrarFallo('email:a@test.cl');
    registrarFallo('email:a@test.cl');
    expect(segundosDeBloqueo('email:b@test.cl')).toBe(0);
  });
});
