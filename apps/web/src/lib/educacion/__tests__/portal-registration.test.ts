import { describe, it, expect } from 'vitest';
import {
  normalizarRut,
  esRutValido,
  esFechaNacimientoValida,
  mismoDia,
  aIsoDate,
  validarApoderado,
  validarHijo,
  validarListaHijos,
  normalizarHijo,
  MAX_HIJOS,
} from '../portal-registration';

const apoderadoValido = {
  rut: '1.234.567-8',
  nombres: 'María',
  apellido_paterno: 'Soto',
  email: 'maria@correo.cl',
  password: 'secreta123',
  telefono: '+56912345678',
};

describe('portal-registration', () => {
  describe('normalizarRut', () => {
    it('quita puntos, espacios y agrega el guion', () => {
      expect(normalizarRut('1.111.111-1')).toBe('1111111-1');
      expect(normalizarRut(' 11111111 1 ')).toBe('11111111-1');
      expect(normalizarRut('111111111')).toBe('11111111-1');
    });

    it('pasa a mayúsculas el dígito verificador K', () => {
      expect(normalizarRut('7.654.321-k')).toBe('7654321-K');
    });

    it('devuelve vacío para entradas que no son RUT', () => {
      expect(normalizarRut(undefined)).toBe('');
      expect(normalizarRut(12345 as unknown)).toBe('');
      expect(normalizarRut('')).toBe('');
    });
  });

  describe('esRutValido', () => {
    it('acepta RUT con cuerpo y dígito verificador', () => {
      expect(esRutValido('11111111-1')).toBe(true);
      expect(esRutValido('1234567-8')).toBe(true);
      expect(esRutValido('7654321-K')).toBe(true);
      expect(esRutValido('1.111.111-1')).toBe(true);
    });

    it('acepta el RUT sin guion cuando el largo es cuerpo+DV', () => {
      expect(esRutValido('111111111')).toBe(true);
      expect(esRutValido('12345678')).toBe(true);
    });

    it('rechaza formatos inválidos', () => {
      expect(esRutValido('')).toBe(false);
      expect(esRutValido('abc-def')).toBe(false);
      expect(esRutValido('11111')).toBe(false); // demasiado corto para llevar DV
      expect(esRutValido('1111111')).toBe(false); // 7 dígitos sin guion = falta el DV
      expect(esRutValido(null)).toBe(false);
      expect(esRutValido('11111111-')).toBe(false);
    });
  });

  describe('esFechaNacimientoValida', () => {
    it('acepta fechas reales pasadas', () => {
      expect(esFechaNacimientoValida('2015-03-15')).toBe(true);
      expect(esFechaNacimientoValida('2012-12-22')).toBe(true);
    });

    it('rechaza fechas imposibles o futuras', () => {
      expect(esFechaNacimientoValida('2015-02-31')).toBe(false);
      expect(esFechaNacimientoValida('2015-13-01')).toBe(false);
      expect(esFechaNacimientoValida('0000-01-01')).toBe(false);
      expect(esFechaNacimientoValida('2999-01-01')).toBe(false);
      expect(esFechaNacimientoValida('15-03-2015')).toBe(false);
      expect(esFechaNacimientoValida('')).toBe(false);
      expect(esFechaNacimientoValida(undefined)).toBe(false);
    });
  });

  describe('mismoDia / aIsoDate', () => {
    it('compara solo por el día, sin importar huso horario', () => {
      expect(mismoDia('2015-03-15', '2015-03-15')).toBe(true);
      expect(mismoDia(new Date('2015-03-15T23:30:00Z'), '2015-03-16')).toBe(false);
      expect(mismoDia('2015-03-15', '2015-03-16')).toBe(false);
      expect(mismoDia('', '2015-03-15')).toBe(false);
    });

    it('extrae YYYY-MM-DD', () => {
      expect(aIsoDate('2015-03-15T00:00:00.000Z')).toBe('2015-03-15');
      expect(aIsoDate(new Date(Date.UTC(2015, 2, 15)))).toBe('2015-03-15');
      expect(aIsoDate('no es fecha')).toBe('');
    });
  });

  describe('validarApoderado', () => {
    it('no devuelve errores con datos válidos', () => {
      expect(validarApoderado(apoderadoValido)).toEqual([]);
    });

    it('exige RUT, nombres, apellido, email y contraseña', () => {
      const errores = validarApoderado({});
      expect(errores.length).toBeGreaterThanOrEqual(4);
      expect(errores.join(' ')).toMatch(/RUT/);
      expect(errores.join(' ')).toMatch(/nombres/);
      expect(errores.join(' ')).toMatch(/apellido paterno/);
      expect(errores.join(' ')).toMatch(/email/i);
      expect(errores.join(' ')).toMatch(/contraseña/);
    });

    it('rechaza contraseña corta y email mal formado', () => {
      const errores = validarApoderado({ ...apoderadoValido, password: '123', email: 'sin-arroba' });
      expect(errores).toHaveLength(2);
    });

    it('el teléfono es opcional pero si viene debe ser válido', () => {
      expect(validarApoderado({ ...apoderadoValido, telefono: '' })).toEqual([]);
      const errores = validarApoderado({ ...apoderadoValido, telefono: 'no-telefono' });
      expect(errores.join(' ')).toMatch(/teléfono/);
    });
  });

  describe('validarHijo', () => {
    it('no devuelve errores con RUT y fecha válidos', () => {
      expect(validarHijo({ rut: '10101010-0', fecha_nacimiento: '2012-12-22' })).toEqual([]);
    });

    it('usa "padre" como vínculo por defecto', () => {
      expect(normalizarHijo({ rut: '10101010-0', fecha_nacimiento: '2012-12-22' }).tipo).toBe('padre');
      expect(normalizarHijo({ rut: '10101010-0', fecha_nacimiento: '2012-12-22', tipo: 'madre' }).tipo).toBe('madre');
    });

    it('rechaza vínculos desconocidos', () => {
      const errores = validarHijo({ rut: '10101010-0', fecha_nacimiento: '2012-12-22', tipo: 'primo' });
      expect(errores.join(' ')).toMatch(/padre, madre o tutor/);
    });

    it('rechaza hijo sin fecha de nacimiento', () => {
      const errores = validarHijo({ rut: '10101010-0' });
      expect(errores.join(' ')).toMatch(/fecha de nacimiento/);
    });
  });

  describe('validarListaHijos', () => {
    it('exige al menos un hijo', () => {
      expect(validarListaHijos([])).toEqual(['Debes registrar al menos un hijo.']);
      expect(validarListaHijos(undefined)).toEqual(['Debes registrar al menos un hijo.']);
    });

    it('acepta una lista válida', () => {
      expect(validarListaHijos([{ rut: '10101010-0', fecha_nacimiento: '2012-12-22' }])).toEqual([]);
    });

    it('detecta el mismo hijo repetido en la lista', () => {
      const errores = validarListaHijos([
        { rut: '10101010-0', fecha_nacimiento: '2012-12-22' },
        { rut: '1.010.1010-0', fecha_nacimiento: '2012-12-22' },
      ]);
      expect(errores).toHaveLength(1);
      expect(errores[0]).toMatch(/repetido/);
    });

    it('acota la cantidad de hijos', () => {
      const hijos = Array.from({ length: MAX_HIJOS + 1 }, (_, i) => ({
        rut: `1111111${i}-1`,
        fecha_nacimiento: '2015-01-01',
      }));
      expect(validarListaHijos(hijos)[0]).toMatch(/hasta/);
    });

    it('señala qué hijo está mal', () => {
      const errores = validarListaHijos([
        { rut: '10101010-0', fecha_nacimiento: '2012-12-22' },
        { rut: 'no-rut', fecha_nacimiento: '2012-12-22' },
      ]);
      expect(errores).toHaveLength(1);
      expect(errores[0]).toMatch(/Hijo 2/);
    });
  });
});
