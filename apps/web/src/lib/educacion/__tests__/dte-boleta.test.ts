import { describe, it, expect } from 'vitest';
import { generarBoletaPension, generarDTEXML } from '../dte-boleta';

describe('dte-boleta', () => {
  describe('generarBoletaPension', () => {
    it('debe generar la boleta correctamente', () => {
      const boleta = generarBoletaPension({
        rutEmisor: '12345678-9',
        razonSocialEmisor: 'Colegio San Andrés',
        rutApoderado: '98765432-1',
        nombreApoderado: 'Juan Pérez',
        folio: 1,
        monto: 150000,
        mes: 10,
        anio: 2026,
        estudianteNombre: 'María Pérez',
        curso: '1° Básico A',
      });

      expect(boleta.rutEmisor).toBe('12345678-9');
      expect(boleta.razonSocialEmisor).toBe('Colegio San Andrés');
      expect(boleta.rutReceptor).toBe('98765432-1');
      expect(boleta.razonSocialReceptor).toBe('Juan Pérez');
      expect(boleta.folio).toBe(1);
      expect(boleta.montoTotal).toBe(150000);
      expect(boleta.montoIva).toBe(Math.round(150000 * 0.19));
      expect(boleta.montoNeto).toBe(150000 - Math.round(150000 * 0.19));
      expect(boleta.glosa).toContain('Pensión Escolar 10/2026');
      expect(boleta.glosa).toContain('María Pérez');
      expect(boleta.glosa).toContain('1° Básico A');
    });

    it('debe calcular el IVA correctamente', () => {
      const boleta = generarBoletaPension({
        rutEmisor: '12345678-9',
        razonSocialEmisor: 'Colegio San Andrés',
        rutApoderado: '98765432-1',
        nombreApoderado: 'Juan Pérez',
        folio: 1,
        monto: 100000,
        mes: 10,
        anio: 2026,
        estudianteNombre: 'María Pérez',
        curso: '1° Básico A',
      });

      expect(boleta.montoIva).toBe(19000);
      expect(boleta.montoNeto).toBe(81000);
    });
  });

  describe('generarDTEXML', () => {
    it('debe generar el XML correctamente', () => {
      const boleta = {
        rutEmisor: '12345678-9',
        razonSocialEmisor: 'Colegio San Andrés',
        rutReceptor: '98765432-1',
        razonSocialReceptor: 'Juan Pérez',
        folio: 1,
        fechaEmision: '2026-10-01',
        montoNeto: 81000,
        montoIva: 19000,
        montoTotal: 100000,
        glosa: 'Pensión Escolar 10/2026 - María Pérez - 1° Básico A',
        mes: 10,
        anio: 2026,
      };

      const xml = generarDTEXML(boleta);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<DTE version="1.0">');
      expect(xml).toContain('<TipoDTE>39</TipoDTE>');
      expect(xml).toContain('<Folio>1</Folio>');
      expect(xml).toContain('<RUTEmisor>12345678-9</RUTEmisor>');
      expect(xml).toContain('<RUTRecep>98765432-1</RUTRecep>');
      expect(xml).toContain('<MntTotal>100000</MntTotal>');
      expect(xml).toContain('Pensión Escolar 10/2026 - María Pérez - 1° Básico A');
    });
  });
});
