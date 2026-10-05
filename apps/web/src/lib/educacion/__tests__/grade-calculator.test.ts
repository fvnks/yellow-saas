import { describe, it, expect } from 'vitest';
import {
  calcularPromedio,
  calcularPromedioPonderado,
  getEstadoNota,
  getColorNota,
  formatearNota,
  calcularPromedioAsignatura,
} from '../grade-calculator';

describe('grade-calculator', () => {
  describe('calcularPromedio', () => {
    it('debe calcular el promedio correctamente', () => {
      expect(calcularPromedio([5.0, 6.0, 7.0])).toBe(6.0);
      expect(calcularPromedio([4.0, 5.0, 6.0])).toBe(5.0);
    });

    it('debe retornar 0 para un arreglo vacío', () => {
      expect(calcularPromedio([])).toBe(0);
    });

    it('debe manejar una sola nota', () => {
      expect(calcularPromedio([5.5])).toBe(5.5);
    });

    it('debe redondear a 1 decimal', () => {
      expect(calcularPromedio([5.33, 6.67])).toBe(6.0);
    });
  });

  describe('calcularPromedioPonderado', () => {
    it('debe calcular el promedio ponderado correctamente', () => {
      const notas = [
        { nota: 5.0, ponderacion: 30 },
        { nota: 6.0, ponderacion: 70 },
      ];
      expect(calcularPromedioPonderado(notas)).toBe(5.7);
    });

    it('debe retornar 0 para un arreglo vacío', () => {
      expect(calcularPromedioPonderado([])).toBe(0);
    });

    it('debe retornar 0 si la suma de ponderaciones es 0', () => {
      const notas = [
        { nota: 5.0, ponderacion: 0 },
        { nota: 6.0, ponderacion: 0 },
      ];
      expect(calcularPromedioPonderado(notas)).toBe(0);
    });
  });

  describe('getEstadoNota', () => {
    it('debe retornar "aprobado" para notas >= 4.0', () => {
      expect(getEstadoNota(4.0)).toBe('aprobado');
      expect(getEstadoNota(5.0)).toBe('aprobado');
      expect(getEstadoNota(7.0)).toBe('aprobado');
    });

    it('debe retornar "reprobado" para notas < 4.0', () => {
      expect(getEstadoNota(3.9)).toBe('reprobado');
      expect(getEstadoNota(1.0)).toBe('reprobado');
    });
  });

  describe('getColorNota', () => {
    it('debe retornar verde para notas >= 6.0', () => {
      expect(getColorNota(6.0)).toBe('text-green-600');
      expect(getColorNota(7.0)).toBe('text-green-600');
    });

    it('debe retornar amarillo para notas entre 4.0 y 5.9', () => {
      expect(getColorNota(4.0)).toBe('text-yellow-600');
      expect(getColorNota(5.9)).toBe('text-yellow-600');
    });

    it('debe retornar rojo para notas < 4.0', () => {
      expect(getColorNota(3.9)).toBe('text-red-600');
      expect(getColorNota(1.0)).toBe('text-red-600');
    });
  });

  describe('formatearNota', () => {
    it('debe formatear la nota con 1 decimal', () => {
      expect(formatearNota(5.0)).toBe('5.0');
      expect(formatearNota(5.5)).toBe('5.5');
      expect(formatearNota(5.56)).toBe('5.6');
      expect(formatearNota(3.94)).toBe('3.9');
    });
  });

  describe('calcularPromedioAsignatura', () => {
    it('debe calcular el promedio simple cuando no hay ponderaciones', () => {
      const calificaciones = [
        { nota: 5.0 },
        { nota: 6.0 },
        { nota: 7.0 },
      ];
      expect(calcularPromedioAsignatura(calificaciones)).toBe(6.0);
    });

    it('debe calcular el promedio ponderado cuando hay ponderaciones', () => {
      const calificaciones = [
        { nota: 5.0, ponderacion: 30 },
        { nota: 6.0, ponderacion: 70 },
      ];
      expect(calcularPromedioAsignatura(calificaciones)).toBe(5.7);
    });

    it('debe retornar 0 para un arreglo vacío', () => {
      expect(calcularPromedioAsignatura([])).toBe(0);
    });
  });
});
