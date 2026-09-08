import type { ParsedDte } from './dte-xml-parser';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_DTE_TYPES = ['33', '34', '39', '52', '56', '61', '110', '111', '112'];

function normalizeRut(rut: string): string {
  return rut.replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').toUpperCase();
}

function isValidRut(rut: string): boolean {
  const clean = normalizeRut(rut);
  if (!clean || clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  const expectedDV = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  return expectedDV === dv;
}

function validateRutdv(rut: string): string | null {
  if (!isValidRut(rut)) return `RUT inválido: ${rut}`;
  return null;
}

export function validateDte(parsed: ParsedDte, companyRut?: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const h = parsed.header;

  // 1. Tipo de DTE válido
  if (!VALID_DTE_TYPES.includes(h.documentType)) {
    errors.push(`Tipo de DTE no soportado: ${h.documentType}`);
  }

  // 2. Folio válido
  if (!h.folio || h.folio <= 0) {
    errors.push('Folio del documento inválido o ausente');
  }

  // 3. Emisor
  if (!h.emitter.rut) {
    errors.push('RUT del emisor ausente');
  } else {
    const rutError = validateRutdv(h.emitter.rut);
    if (rutError) warnings.push(rutError);
  }
  if (!h.emitter.name) {
    warnings.push('Nombre del emisor ausente');
  }

  // 4. Receptor
  if (!h.receiver.rut) {
    errors.push('RUT del receptor ausente');
  } else {
    const rutError = validateRutdv(h.receiver.rut);
    if (rutError) warnings.push(rutError);
  }

  // 5. Receptor corresponde a la empresa (si se proporciona RUT)
  if (companyRut && h.receiver.rut) {
    const normalizedCompany = normalizeRut(companyRut);
    const normalizedReceiver = normalizeRut(h.receiver.rut);
    if (normalizedCompany !== normalizedReceiver) {
      errors.push(`El RUT receptor (${h.receiver.rut}) no corresponde a la empresa (${companyRut})`);
    }
  }

  // 6. Fecha de emisión
  if (!h.issueDate || h.issueDate === 'Invalid Date') {
    errors.push('Fecha de emisión inválida o ausente');
  } else {
    const issueDate = new Date(h.issueDate);
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearFuture = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    if (issueDate < oneYearAgo) {
      warnings.push('Fecha de emisión mayor a 1 año en el pasado');
    }
    if (issueDate > oneYearFuture) {
      warnings.push('Fecha de emisión mayor a 1 año en el futuro');
    }
  }

  // 7. Montos
  if (h.totals.totalAmount <= 0 && parsed.items.length > 0) {
    warnings.push('El monto total es $0 o negativo');
  }

  // 8. Coherencia de montos (tolerancia de $1 por redondeo)
  const computedNet = parsed.items
    .filter(i => !i.isExempt)
    .reduce((sum, i) => sum + i.lineTotal, 0);
  const computedExempt = parsed.items
    .filter(i => i.isExempt)
    .reduce((sum, i) => sum + i.lineTotal, 0);
  const computedIva = Math.round(computedNet * h.totals.vatRate);
  const computedTotal = computedNet + computedExempt + computedIva;

  if (Math.abs(computedTotal - h.totals.totalAmount) > 1) {
    warnings.push(
      `Inconsistencia en montos: calculado $${computedTotal.toLocaleString('es-CL')} vs declarado $${h.totals.totalAmount.toLocaleString('es-CL')}`
    );
  }

  // 9. Items
  if (parsed.items.length === 0) {
    warnings.push('El documento no tiene líneas de detalle');
  }
  for (const item of parsed.items) {
    if (!item.productName) {
      warnings.push(`Línea ${item.lineNumber}: nombre del producto ausente`);
    }
    if (item.quantity <= 0) {
      warnings.push(`Línea ${item.lineNumber}: cantidad inválida (${item.quantity})`);
    }
  }

  // 10. Referencias (NC/ND deben tener al menos una)
  if (['56', '61'].includes(h.documentType) && parsed.references.length === 0) {
    warnings.push(`El documento tipo ${h.documentType} (${h.documentTypeLabel}) debería tener al menos una referencia`);
  }

  // 11. Moneda
  if (h.currency && !['CLP', 'USD', 'EUR', 'UF'].includes(h.currency)) {
    warnings.push(`Moneda no estándar: ${h.currency}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
