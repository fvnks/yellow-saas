import { describe, it, expect } from 'vitest';

// Testing formatting utilities used across the ERP
// These are pure functions extracted from the codebase

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

function formatCLP(value: number): string {
  return clpFormatter.format(value);
}

function formatRUT(rut: string): string {
  if (!rut) return '';
  const clean = rut.replace(/\./g, '').replace(/-/g, '');
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

function formatCurrencyCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

describe('formatCLP - formato de pesos chilenos', () => {
  it('formatea número entero con separadores de miles', () => {
    expect(formatCLP(1_000_000)).toBe('$1.000.000');
  });

  it('formatea cero correctamente', () => {
    expect(formatCLP(0)).toBe('$0');
  });

  it('formatea números negativos con formato locale CLP', () => {
    // es-CL locale places $ before negative sign
    const result = formatCLP(-500_000);
    expect(result).toContain('500.000');
    expect(result).toContain('$');
    expect(result).toContain('-');
  });

  it('redondea decimales a entero', () => {
    expect(formatCLP(1_234_567.89)).toBe('$1.234.568');
  });

  it('formatea montos pequeños', () => {
    expect(formatCLP(999)).toBe('$999');
  });

  it('formatea montos grandes (millones)', () => {
    expect(formatCLP(99_999_999)).toBe('$99.999.999');
  });

  it('usa prefijo $ de peso chileno', () => {
    const result = formatCLP(100);
    expect(result.startsWith('$')).toBe(true);
  });

  it('no tiene parte decimal (maximumFractionDigits: 0)', () => {
    const result = formatCLP(1_234_567.67);
    // es-CL uses . as thousands separator; verify no decimal separator
    expect(result).not.toContain(',');
  });
});

describe('formatRUT - formato de RUT chileno', () => {
  it('formatea RUT de 8 dígitos (7 body + 1 DV)', () => {
    // 12345678 → body=1234567, dv=8 → 1.234.567-8
    expect(formatRUT('12345678')).toBe('1.234.567-8');
  });

  it('formatea RUT de 9 dígitos (8 body + 1 DV)', () => {
    // 123456789 → body=12345678, dv=9 → 12.345.678-9
    expect(formatRUT('123456789')).toBe('12.345.678-9');
  });

  it('limpia puntos existentes antes de formatear', () => {
    // 12.345.678 → clean=12345678 → body=1234567, dv=8 → 1.234.567-8
    expect(formatRUT('12.345.678')).toBe('1.234.567-8');
  });

  it('limpia guiones existentes', () => {
    // 12345678-9 → clean=123456789 → body=12345678, dv=9 → 12.345.678-9
    expect(formatRUT('12345678-9')).toBe('12.345.678-9');
  });

  it('limpia puntos y guiones mixtos', () => {
    // 12.345.678-9 → clean=123456789 → 12.345.678-9
    expect(formatRUT('12.345.678-9')).toBe('12.345.678-9');
  });

  it('retorna string vacío para input vacío', () => {
    expect(formatRUT('')).toBe('');
  });

  it('maneja RUT corto (7 dígitos)', () => {
    // 1234567 → body=123456, dv=7 → 123.456-7
    expect(formatRUT('1234567')).toBe('123.456-7');
  });

  it('maneja RUT largo (9 dígitos = 8 body + 1 DV)', () => {
    // 123456789 → 12.345.678-9
    expect(formatRUT('123456789')).toBe('12.345.678-9');
  });
});

describe('formatCurrencyCLP - formato de moneda', () => {
  it('formatea valor positivo con formato chileno', () => {
    expect(formatCurrencyCLP(1_500_000)).toBe('$1.500.000');
  });

  it('formatea cero', () => {
    expect(formatCurrencyCLP(0)).toBe('$0');
  });

  it('formatea valor negativo con formato locale', () => {
    const result = formatCurrencyCLP(-250_000);
    expect(result).toContain('250.000');
    expect(result).toContain('$');
    expect(result).toContain('-');
  });

  it('redondea decimales a entero', () => {
    expect(formatCurrencyCLP(99_999.50)).toBe('$100.000');
  });

  it('resultados son consistentes con formatCLP', () => {
    const values = [0, 1, 100, 1_000, 100_000, 1_000_000, 99_999_999];
    for (const val of values) {
      expect(formatCurrencyCLP(val)).toBe(formatCLP(val));
    }
  });
});
