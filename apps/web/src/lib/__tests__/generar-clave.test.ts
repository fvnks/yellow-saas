import { describe, it, expect } from 'vitest';
import { generarClave } from '../generar-clave';

describe('generarClave', () => {
  it('genera claves de 10 caracteres alfanuméricos por defecto', () => {
    const clave = generarClave();
    expect(clave).toHaveLength(10);
    expect(clave).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('respeta la longitud pedida y acota entre 8 y 32', () => {
    expect(generarClave(12)).toHaveLength(12);
    expect(generarClave(32)).toHaveLength(32);
    expect(generarClave(4)).toHaveLength(8);
    expect(generarClave(999)).toHaveLength(32);
  });

  it('incluye siempre mayúscula, minúscula y dígito', () => {
    for (let i = 0; i < 100; i++) {
      const clave = generarClave();
      expect(clave).toMatch(/[A-Z]/);
      expect(clave).toMatch(/[a-z]/);
      expect(clave).toMatch(/[2-9]/);
    }
  });

  it('evita caracteres ambiguos (0, O, 1, l, I)', () => {
    for (let i = 0; i < 100; i++) {
      expect(generarClave()).not.toMatch(/[0O1Il]/);
    }
  });

  it('no repite claves en sucesión (azar criptográfico)', () => {
    const claves = new Set(Array.from({ length: 50 }, () => generarClave()));
    expect(claves.size).toBe(50);
  });
});
