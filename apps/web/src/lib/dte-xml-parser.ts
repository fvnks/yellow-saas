import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
  parseTagValue: false,
  trimValues: true,
  processEntities: false,
  htmlEntities: false,
  parseAttributeValue: false,
  isArray: (name) => {
    return name === 'Detalle' || name === 'Referencia';
  },
});

export interface DteHeader {
  documentType: string;
  documentTypeLabel: string;
  folio: number;
  issueDate: string;
  emitter: {
    rut: string;
    name: string;
    tradeName?: string;
    address?: string;
    city?: string;
    region?: string;
  };
  receiver: {
    rut: string;
    name: string;
    address?: string;
    city?: string;
    region?: string;
  };
  totals: {
    netAmount: number;
    exemptAmount: number;
    vatAmount: number;
    totalAmount: number;
    vatRate: number;
  };
  currency: string;
  paymentMethod?: string;
  observations?: string;
}

export interface DteItem {
  lineNumber: number;
  productCode?: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  isExempt: boolean;
}

export interface DteReference {
  referenceType: string;
  referenceFolio?: number;
  referenceDate?: string;
  referenceCode?: string;
  referenceReason?: string;
}

export interface ParsedDte {
  header: DteHeader;
  items: DteItem[];
  references: DteReference[];
  rawXml: string;
  sha256: string;
}

const DTE_TYPE_LABELS: Record<string, string> = {
  '33': 'Factura Electrónica',
  '34': 'Factura No Afecta o Exenta Electrónica',
  '39': 'Boleta Electrónica',
  '52': 'Guía de Despacho Electrónica',
  '56': 'Nota de Débito Electrónica',
  '61': 'Nota de Crédito Electrónica',
  '110': 'Factura de Compra Electrónica',
  '111': 'Boleta de Compra Electrónica',
  '112': 'Liquidación de Factura Electrónica',
};

function normalizeRut(rut: string | undefined): string {
  if (!rut) return '';
  return rut.replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').toUpperCase();
}

function parseDate(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  // DTE dates are YYYY-MM-DD or DD/MM/YYYY
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dateStr.substring(0, 10);
}

function parseNumber(val: string | undefined): number {
  if (!val) return 0;
  const n = parseFloat(val.replace(/\./g, '').replace(',', '.'));
  return isNaN(n) ? 0 : Math.round(n);
}

function extractText(obj: any): string {
  if (typeof obj === 'string') return obj.trim();
  if (typeof obj === 'number') return String(obj);
  if (obj === null || obj === undefined) return '';
  if (typeof obj === 'object') {
    if (obj['#text'] !== undefined) return extractText(obj['#text']);
    return '';
  }
  return String(obj).trim();
}

function getEmisor(root: any): any {
  return root?.DTE?.Documento?.Encabezado?.Emisor
    || root?.DTE?.Documento?.Encabezado?.CartaPorte?.Emisor
    || root?.DTE?.Documento?.Encabezado?.Transporte?.Propietario
    || {};
}

function getReceptor(root: any): any {
  return root?.DTE?.Documento?.Encabezado?.Receptor
    || root?.DTE?.Documento?.Encabezado?.CartaPorte?.Receptor
    || {};
}

function getTotales(root: any): any {
  return root?.DTE?.Documento?.Encabezado?.Totales
    || root?.DTE?.Documento?.Encabezado?.CartaPorte?.Totales
    || {};
}

function getEncabezado(root: any): any {
  return root?.DTE?.Documento?.Encabezado
    || root?.DTE?.Documento?.Encabezado?.CartaPorte
    || {};
}

function getDetalle(root: any): any[] {
  const enc = getEncabezado(root);
  let detalle = enc?.Detalle;
  if (!detalle) return [];
  if (!Array.isArray(detalle)) detalle = [detalle];
  return detalle;
}

function getReferencias(root: any): any[] {
  let refs = root?.DTE?.Documento?.Referencia;
  if (!refs) return [];
  if (!Array.isArray(refs)) refs = [refs];
  return refs;
}

export async function computeSha256(data: Buffer | string): Promise<string> {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(data).digest('hex');
}

export function parseDteXml(xmlString: string): ParsedDte {
  const root = xmlParser.parse(xmlString);

  if (!root?.DTE?.Documento) {
    throw new Error('XML no contiene un DTE válido (se esperaba <DTE><Documento>)');
  }

  const encabezado = getEncabezado(root);
  const emisor = getEmisor(root);
  const receptor = getReceptor(root);
  const totales = getTotales(root);
  const detalle = getDetalle(root);
  const referencias = getReferencias(root);

  const docType = extractText(encabezado?.IdDoc?.TipoDTE);
  const folio = parseNumber(extractText(encabezado?.IdDoc?.Folio));

  if (!docType) throw new Error('No se pudo determinar el tipo de documento DTE');
  if (!folio) throw new Error('No se pudo determinar el folio del documento');

  const netAmount = parseNumber(extractText(totales?.MntNeto));
  const exemptAmount = parseNumber(extractText(totales?.MntExe));
  const ivaAmount = parseNumber(extractText(totales?.IVA));
  const totalAmount = parseNumber(extractText(totales?.MntTotal));

  // IVA rate detection: if there's IVA, check the tasa
  let vatRate = 0.19;
  const ivaItem = totales?.IVATrans;
  if (ivaItem) {
    const rate = parseFloat(extractText(ivaItem));
    if (!isNaN(rate) && rate > 0) vatRate = rate / 100;
  }

  const items: DteItem[] = detalle.map((d: any, idx: number) => {
    const qty = parseNumber(extractText(d?.QtyItem));
    const unitPrice = parseNumber(extractText(d?.PrcItem));
    const discount = parseNumber(extractText(d?.DescuentoMonto));
    const lineTotal = parseNumber(extractText(d?.MontoItem));
    const isExempt = extractText(d?.IndExe) === '1' || extractText(d?.CdgItem?.TpoCodigo) === 'EXENTO';

    return {
      lineNumber: idx + 1,
      productCode: extractText(d?.CdgItem?.VlrCodigo) || undefined,
      productName: extractText(d?.NmbItem) || `Ítem ${idx + 1}`,
      quantity: qty || 1,
      unit: extractText(d?.UnmdItem) || 'UN',
      unitPrice,
      discountPercent: 0,
      discountAmount: discount,
      lineTotal: lineTotal || (qty * unitPrice - discount),
      isExempt,
    };
  });

  const references: DteReference[] = referencias.map((r: any) => ({
    referenceType: extractText(r?.TpoDocRef) || '',
    referenceFolio: parseNumber(extractText(r?.FolioRef)) || undefined,
    referenceDate: parseDate(extractText(r?.FchRef)) || undefined,
    referenceCode: extractText(r?.CodRef) || undefined,
    referenceReason: extractText(r?.RazonRef) || undefined,
  }));

  const header: DteHeader = {
    documentType: docType,
    documentTypeLabel: DTE_TYPE_LABELS[docType] || `DTE ${docType}`,
    folio,
    issueDate: parseDate(extractText(encabezado?.IdDoc?.FchEmis)),
    emitter: {
      rut: normalizeRut(extractText(emisor?.RUTEmisor)),
      name: extractText(emisor?.RznSocEmisor) || extractText(emisor?.RznSoc) || '',
      tradeName: extractText(emisor?.GiroEmisor) || undefined,
      address: extractText(emisor?.DirEmisor) || undefined,
      city: extractText(emisor?.CmnaEmisor) || undefined,
      region: extractText(emisor?.CiudadEmisor) || undefined,
    },
    receiver: {
      rut: normalizeRut(extractText(receptor?.RUTRecep) || extractText(receptor?.RUTRecepx)),
      name: extractText(receptor?.RznSocRecep) || extractText(receptor?.RznSocRecb) || '',
      address: extractText(receptor?.DirRecep) || undefined,
      city: extractText(receptor?.CmnaRecep) || undefined,
      region: extractText(receptor?.CiudadRecep) || undefined,
    },
    totals: {
      netAmount,
      exemptAmount,
      vatAmount: ivaAmount,
      totalAmount: totalAmount || (netAmount + exemptAmount + ivaAmount),
      vatRate,
    },
    currency: extractText(encabezado?.IdDoc?.Moneda) || 'CLP',
    paymentMethod: extractText(encabezado?.IdDoc?.FmaPag) || undefined,
    observations: extractText(root?.DTE?.Documento?.Ted?.DD?.CAf?.RSK) || undefined,
  };

  return {
    header,
    items,
    references,
    rawXml: xmlString,
    sha256: '',
  };
}
