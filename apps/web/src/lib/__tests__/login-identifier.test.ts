import { describe, it, expect } from 'vitest';
import {
  clasificarIdentificador,
  normalizarNombre,
  coincideNombreCompleto,
  tokenBusquedaNombre,
  claveIntentos,
} from '../login-identifier';

describe('clasificarIdentificador', () => {
  it('detecta correo, RUT y nombre', () => {
    expect(clasificarIdentificador('maria.gonzalez@correo.cl')).toBe('email');
    expect(clasificarIdentificador('  12.345.678-9 ')).toBe('rut');
    expect(clasificarIdentificador('12345678-9')).toBe('rut');
    expect(clasificarIdentificador('123456789')).toBe('rut');
    expect(clasificarIdentificador('María González')).toBe('nombre');
  });

  it('un número corto sin forma de RUT se trata como nombre', () => {
    expect(clasificarIdentificador('1234567')).toBe('nombre');
  });

  it('acepta valores no string sin lanzar', () => {
    expect(clasificarIdentificador(undefined)).toBe('nombre');
    expect(clasificarIdentificador(null)).toBe('nombre');
    expect(clasificarIdentificador(123456)).toBe('nombre');
  });
});

describe('normalizarNombre', () => {
  it('quita acentos, mayúsculas y puntuación', () => {
    expect(normalizarNombre('María José González-López')).toBe('maria jose gonzalez lopez');
    expect(normalizarNombre('  NIÑO  ')).toBe('nino');
    expect(normalizarNombre('  María   GONZÁLEZ ')).toBe('maria gonzalez');
  });
});

describe('coincideNombreCompleto', () => {
  const nombres = 'María José';
  const paterno = 'González';
  const materno = 'López';

  it('coincide con nombre + apellido en cualquier orden', () => {
    expect(coincideNombreCompleto('María González', nombres, paterno, materno)).toBe(true);
    expect(coincideNombreCompleto('gonzalez maria', nombres, paterno, materno)).toBe(true);
    expect(coincideNombreCompleto('maria lopez', nombres, paterno, materno)).toBe(true);
    expect(coincideNombreCompleto('maría josé gonzález', nombres, paterno, materno)).toBe(true);
  });

  it('rechaza tokens que no están en la ficha', () => {
    expect(coincideNombreCompleto('María Pérez', nombres, paterno, materno)).toBe(false);
    expect(coincideNombreCompleto('Carlos González', nombres, paterno, materno)).toBe(false);
  });

  it('rechaza entradas vacías', () => {
    expect(coincideNombreCompleto('', nombres, paterno, materno)).toBe(false);
    expect(coincideNombreCompleto('   ', nombres, paterno, materno)).toBe(false);
  });
});

describe('tokenBusquedaNombre', () => {
  it('usa el último token (el apellido)', () => {
    expect(tokenBusquedaNombre('María José González')).toBe('gonzalez');
    expect(tokenBusquedaNombre('González')).toBe('gonzalez');
    expect(tokenBusquedaNombre('')).toBe('');
  });
});

describe('claveIntentos', () => {
  it('normaliza correo sin importar mayúsculas o espacios', () => {
    expect(claveIntentos('email', '  Maria@Claro.CL ')).toBe('email:maria@claro.cl');
  });

  it('normaliza RUT con puntos, guion o pegado', () => {
    expect(claveIntentos('rut', '12.345.678-9')).toBe('rut:12345678-9');
    expect(claveIntentos('rut', '123456789')).toBe('rut:12345678-9');
  });

  it('normaliza nombre con acentos', () => {
    expect(claveIntentos('nombre', '  María   GONZÁLEZ ')).toBe('nombre:maria gonzalez');
  });
});
