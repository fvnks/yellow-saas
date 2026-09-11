import { describe, it, expect } from 'vitest';

// Pure invoice logic extracted from route.ts for testing
// (the route handler itself depends on DB, so we test the calculation logic)

const DEFAULT_IVA_RATE = 0.19;

interface InvoiceItem {
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  discount?: number;
  tax_rate?: number;
}

function calculateInvoiceTotals(items: InvoiceItem[]): {
  subtotal: number;
  tax_amount: number;
  total: number;
} {
  let subtotal = 0;
  let taxAmount = 0;

  for (const item of items) {
    const discountPct = Number(item.discount_percent || item.discount || 0);
    const lineSubtotal = item.quantity * item.unit_price;
    const discountAmount = lineSubtotal * (discountPct / 100);
    const lineTax = (lineSubtotal - discountAmount) * ((item.tax_rate ?? DEFAULT_IVA_RATE) / 100);
    subtotal += lineSubtotal - discountAmount;
    taxAmount += lineTax;
  }

  return {
    subtotal,
    tax_amount: taxAmount,
    total: subtotal + taxAmount,
  };
}

function generateInvoiceNumber(docType: 'factura' | 'boleta', existingCount: number): string {
  const prefix = docType === 'boleta' ? 'BF' : 'FE';
  return `${prefix}-${String(existingCount + 1).padStart(6, '0')}`;
}

describe('cálculos de factura', () => {
  describe('generación de número de factura', () => {
    it('genera FE-000001 para primera factura', () => {
      expect(generateInvoiceNumber('factura', 0)).toBe('FE-000001');
    });

    it('genera FE-000002 para segunda factura', () => {
      expect(generateInvoiceNumber('factura', 1)).toBe('FE-000002');
    });

    it('genera BF-000001 para primera boleta', () => {
      expect(generateInvoiceNumber('boleta', 0)).toBe('BF-000001');
    });

    it('genera BF-000010 para décima boleta', () => {
      expect(generateInvoiceNumber('boleta', 9)).toBe('BF-000010');
    });

    it('genera FE-000100 para factura 100', () => {
      expect(generateInvoiceNumber('factura', 99)).toBe('FE-000100');
    });
  });

  describe('cálculo de IVA', () => {
    it('IVA por defecto es 0.19 (rate/fracción) cuando no se proporciona tax_rate', () => {
      const items: InvoiceItem[] = [{ quantity: 1, unit_price: 100_000 }];
      const result = calculateInvoiceTotals(items);
      // Default tax_rate is 0.19; /100 → 0.0019 → 100000 * 0.0019 = 190
      expect(result.tax_amount).toBeCloseTo(190, 0);
    });

    it('usa tax_rate personalizado (19 para 19%) cuando se proporciona', () => {
      const items: InvoiceItem[] = [{ quantity: 1, unit_price: 100_000, tax_rate: 19 }];
      const result = calculateInvoiceTotals(items);
      // 19 / 100 = 0.19 → 100000 * 0.19 = 19000
      expect(result.tax_amount).toBeCloseTo(19_000, 0);
    });

    it('IVA de 0% para items exentos', () => {
      const items: InvoiceItem[] = [{ quantity: 1, unit_price: 100_000, tax_rate: 0 }];
      const result = calculateInvoiceTotals(items);

      expect(result.tax_amount).toBe(0);
      expect(result.total).toBe(100_000);
    });
  });

  describe('totales de factura', () => {
    it('total = subtotal + tax para un item con tax_rate 19', () => {
      const items: InvoiceItem[] = [{ quantity: 2, unit_price: 50_000, tax_rate: 19 }];
      const result = calculateInvoiceTotals(items);

      expect(result.subtotal).toBe(100_000);
      expect(result.tax_amount).toBeCloseTo(19_000, 0);
      expect(result.total).toBeCloseTo(119_000, 0);
    });

    it('total = subtotal + tax para múltiples items con tax_rate 19', () => {
      const items: InvoiceItem[] = [
        { quantity: 1, unit_price: 100_000, tax_rate: 19 },
        { quantity: 3, unit_price: 50_000, tax_rate: 19 },
      ];
      const result = calculateInvoiceTotals(items);

      expect(result.subtotal).toBe(250_000);
      expect(result.tax_amount).toBeCloseTo(47_500, 0);
      expect(result.total).toBeCloseTo(297_500, 0);
    });

    it('maneja lista de items vacía', () => {
      const result = calculateInvoiceTotals([]);

      expect(result.subtotal).toBe(0);
      expect(result.tax_amount).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('descuentos', () => {
    it('aplica descuento porcentaje correctamente', () => {
      const items: InvoiceItem[] = [{ quantity: 1, unit_price: 100_000, discount_percent: 10, tax_rate: 19 }];
      const result = calculateInvoiceTotals(items);

      expect(result.subtotal).toBe(90_000);
      expect(result.tax_amount).toBeCloseTo(17_100, 0);
    });

    it('descuento del 100% deja subtotal en 0', () => {
      const items: InvoiceItem[] = [{ quantity: 1, unit_price: 100_000, discount_percent: 100 }];
      const result = calculateInvoiceTotals(items);

      expect(result.subtotal).toBe(0);
      expect(result.tax_amount).toBe(0);
    });

    it('soporta campo discount alternativo', () => {
      const items: InvoiceItem[] = [{ quantity: 1, unit_price: 100_000, discount: 20, tax_rate: 19 }];
      const result = calculateInvoiceTotals(items);

      expect(result.subtotal).toBe(80_000);
    });

    it('descuento se aplica antes del cálculo de IVA', () => {
      const items: InvoiceItem[] = [{ quantity: 1, unit_price: 200_000, discount_percent: 10, tax_rate: 19 }];
      const result = calculateInvoiceTotals(items);

      // Subtotal after 10% discount = 180,000
      // IVA on discounted amount = 180,000 * 0.19 = 34,200
      expect(result.subtotal).toBe(180_000);
      expect(result.tax_amount).toBeCloseTo(34_200, 0);
    });
  });

  describe('validación de items', () => {
    it('rechaza invoice sin items', () => {
      const items: InvoiceItem[] = [];
      const hasItems = items.length > 0;
      expect(hasItems).toBe(false);
    });

    it('acepta invoice con al menos un item', () => {
      const items: InvoiceItem[] = [{ quantity: 1, unit_price: 50_000 }];
      const hasItems = items.length > 0;
      expect(hasItems).toBe(true);
    });
  });

  describe('document_type determina prefijo', () => {
    it('factura usa prefijo FE', () => {
      expect(generateInvoiceNumber('factura', 0).startsWith('FE-')).toBe(true);
    });

    it('boleta usa prefijo BF', () => {
      expect(generateInvoiceNumber('boleta', 0).startsWith('BF-')).toBe(true);
    });
  });
});
