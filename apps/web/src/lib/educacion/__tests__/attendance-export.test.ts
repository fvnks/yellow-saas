import { describe, it, expect } from 'vitest';
import {
  calcularPorcentajeAsistencia,
  getEstadoAsistencia,
  generarFormatoMineduc,
  agruparAsistenciaPorCurso,
} from '../attendance-export';

describe('attendance-export', () => {
  describe('calcularPorcentajeAsistencia', () => {
    it('debe calcular el porcentaje correctamente', () => {
      expect(calcularPorcentajeAsistencia(18, 20)).toBe(90);
      expect(calcularPorcentajeAsistencia(19, 20)).toBe(95);
      expect(calcularPorcentajeAsistencia(20, 20)).toBe(100);
    });

    it('debe retornar 0 si el total es 0', () => {
      expect(calcularPorcentajeAsistencia(0, 0)).toBe(0);
    });

    it('debe manejar casos donde presentes > total', () => {
      expect(calcularPorcentajeAsistencia(25, 20)).toBe(125);
    });
  });

  describe('getEstadoAsistencia', () => {
    it('debe retornar "Excelente" para >= 95%', () => {
      expect(getEstadoAsistencia(95)).toEqual({ label: 'Excelente', color: 'text-green-600' });
      expect(getEstadoAsistencia(100)).toEqual({ label: 'Excelente', color: 'text-green-600' });
    });

    it('debe retornar "Bueno" para >= 90%', () => {
      expect(getEstadoAsistencia(90)).toEqual({ label: 'Bueno', color: 'text-blue-600' });
      expect(getEstadoAsistencia(94)).toEqual({ label: 'Bueno', color: 'text-blue-600' });
    });

    it('debe retornar "Regular" para >= 85%', () => {
      expect(getEstadoAsistencia(85)).toEqual({ label: 'Regular', color: 'text-yellow-600' });
      expect(getEstadoAsistencia(89)).toEqual({ label: 'Regular', color: 'text-yellow-600' });
    });

    it('debe retornar "Deficiente" para < 85%', () => {
      expect(getEstadoAsistencia(84)).toEqual({ label: 'Deficiente', color: 'text-red-600' });
      expect(getEstadoAsistencia(50)).toEqual({ label: 'Deficiente', color: 'text-red-600' });
    });
  });

  describe('generarFormatoMineduc', () => {
    it('debe generar el formato CSV correctamente', () => {
      const estudiantes = [
        {
          rut: '12345678-9',
          nombre: 'Juan Pérez',
          curso: '1° Básico A',
          presentes: 18,
          ausentes: 2,
          atrasos: 0,
        },
      ];

      const csv = generarFormatoMineduc(estudiantes);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('RUT\tNombre\tCurso\tPresentes\tAusentes\tAtrasos\t% Asistencia');
      expect(lines[1]).toBe('12345678-9\tJuan Pérez\t1° Básico A\t18\t2\t0\t90%');
    });

    it('debe manejar múltiples estudiantes', () => {
      const estudiantes = [
        {
          rut: '12345678-9',
          nombre: 'Juan Pérez',
          curso: '1° Básico A',
          presentes: 18,
          ausentes: 2,
          atrasos: 0,
        },
        {
          rut: '98765432-1',
          nombre: 'María López',
          curso: '1° Básico A',
          presentes: 20,
          ausentes: 0,
          atrasos: 0,
        },
      ];

      const csv = generarFormatoMineduc(estudiantes);
      const lines = csv.split('\n');

      expect(lines).toHaveLength(3); // Header + 2 estudiantes
    });
  });

  describe('agruparAsistenciaPorCurso', () => {
    it('debe agrupar asistencia por curso correctamente', () => {
      const asistencias = [
        { curso_id: '1', curso_nombre: '1° Básico A', estado: 'presente' },
        { curso_id: '1', curso_nombre: '1° Básico A', estado: 'ausente' },
        { curso_id: '2', curso_nombre: '2° Básico A', estado: 'presente' },
      ];

      const resultado = agruparAsistenciaPorCurso(asistencias);

      expect(resultado.size).toBe(2);
      expect(resultado.get('1')).toEqual({
        curso_nombre: '1° Básico A',
        presentes: 1,
        ausentes: 1,
        total: 2,
      });
      expect(resultado.get('2')).toEqual({
        curso_nombre: '2° Básico A',
        presentes: 1,
        ausentes: 0,
        total: 1,
      });
    });

    it('debe manejar un arreglo vacío', () => {
      const resultado = agruparAsistenciaPorCurso([]);
      expect(resultado.size).toBe(0);
    });
  });
});
