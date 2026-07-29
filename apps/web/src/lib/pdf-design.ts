import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://yellow-erp.cl';

export interface CompanyData {
  name: string;
  tax_id?: string;
  razon_social?: string;
  giro?: string;
  address?: string;
  city?: string;
  region?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

export interface DocumentItem {
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  tax_rate?: number;
  total: number;
}

export interface DocumentData {
  id: string;
  number: string;
  type: 'boleta' | 'factura' | 'cotizacion' | 'orden_venta' | 'orden_compra';
  date: string;
  due_date?: string;
  company: CompanyData;
  customer?: { name: string; tax_id?: string; address?: string; email?: string; phone?: string };
  supplier?: { name: string; tax_id?: string; address?: string; phone?: string };
  items: DocumentItem[];
  subtotal: number;
  tax_amount: number;
  total: number;
  notes?: string;
  payment_terms?: number;
  delivery_date?: string;
  warehouse?: string;
  valid_until?: string;
  payment_method?: string;
}

export interface PayslipData {
  company: CompanyData;
  employee: {
    first_name: string;
    last_name: string;
    rut: string;
    position: string;
    department: string;
    contract_type: string;
    hire_date: string;
    afp_fund: string;
    health_type: string;
  };
  period: {
    label: string;
    start_date: string;
    end_date: string;
  };
  earnings: { concept: string; amount: number; quantity?: number; unit_value?: number }[];
  deductions: { concept: string; amount: number }[];
  employerContributions: { concept: string; amount: number }[];
  totals: {
    gross: number;
    total_deductions: number;
    total_employer: number;
    total_tax: number;
    net_pay: number;
  };
}

export interface LiquidationData {
  company: CompanyData;
  employee_name: string;
  employee_rut: string;
  position: string;
  department: string;
  contract_type: string;
  hire_date: string;
  base_salary: number;
  termination_type: string;
  termination_date: string;
  years_of_service: number;
  items: { code: string; concept: string; amount: number; taxable: boolean; category: string }[];
  totals: {
    earnings: number;
    severance: number;
    compensation: number;
    deductions: number;
    notice: number;
    net_total: number;
  };
}

const COLORS = {
  primary: [30, 30, 30] as [number, number, number],
  accent: [79, 70, 229] as [number, number, number],
  lightBg: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  textDark: [15, 23, 42] as [number, number, number],
  textMuted: [100, 116, 139] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
};

const DOC_TYPE_LABELS: Record<string, string> = {
  boleta: 'BOLETA DE VENTA',
  factura: 'FACTURA DE VENTA',
  cotizacion: 'COTIZACIÓN',
  orden_venta: 'ORDEN DE VENTA',
  orden_compra: 'ORDEN DE COMPRA',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

async function fetchLogoAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function generateQRDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { width: 120, margin: 1, color: { dark: '#1e293b', light: '#ffffff' } });
}

function getDocTypeRoute(type: string): string {
  switch (type) {
    case 'boleta': return 'boleta';
    case 'cotizacion': return 'cotizacion';
    case 'orden_venta': return 'orden-venta';
    case 'orden_compra': return 'orden-compra';
    default: return type;
  }
}

async function buildDocumentHeader(doc: jsPDF, data: DocumentData): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Logo
  if (data.company.logo_url) {
    try {
      const logoDataUrl = await fetchLogoAsDataUrl(data.company.logo_url);
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', 15, y, 30, 30);
      }
    } catch { /* skip logo */ }
  }

  // Company info (left)
  const textStartX = data.company.logo_url ? 50 : 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.textDark);
  doc.text(data.company.name || 'Empresa', textStartX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  let infoY = y + 12;
  if (data.company.tax_id) { doc.text(`RUT: ${data.company.tax_id}`, textStartX, infoY); infoY += 4; }
  if (data.company.razon_social) { doc.text(data.company.razon_social, textStartX, infoY); infoY += 4; }
  if (data.company.giro) { doc.text(`Giro: ${data.company.giro}`, textStartX, infoY); infoY += 4; }
  if (data.company.address) { doc.text(data.company.address, textStartX, infoY); infoY += 4; }
  if (data.company.phone) { doc.text(`Tel: ${data.company.phone}`, textStartX, infoY); infoY += 4; }
  if (data.company.email) { doc.text(data.company.email, textStartX, infoY); }

  // QR Code (right)
  const qrUrl = `${BASE_URL}/view/${getDocTypeRoute(data.type)}/${data.id}`;
  try {
    const qrDataUrl = await generateQRDataUrl(qrUrl);
    doc.addImage(qrDataUrl, 'PNG', pageWidth - 40, y, 28, 28);
  } catch { /* skip QR */ }

  y = Math.max(y + 35, infoY + 5);

  // Separator line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  // Document type badge
  const docLabel = DOC_TYPE_LABELS[data.type] || data.type.toUpperCase();
  doc.setFillColor(...COLORS.primary);
  const badgeWidth = doc.getTextWidth(docLabel) + 12;
  doc.roundedRect(15, y - 4, badgeWidth, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(docLabel, 21, y + 1);

  // Document number and date (right of badge)
  doc.setTextColor(...COLORS.textDark);
  doc.setFontSize(9);
  doc.text(`N°: ${data.number}`, 15 + badgeWidth + 10, y + 1);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Fecha: ${formatDate(data.date)}`, pageWidth - 15, y + 1, { align: 'right' });

  y += 10;

  // Due date / Validity / Delivery date
  if (data.due_date) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`Vencimiento: ${formatDate(data.due_date)}`, 15, y);
    y += 5;
  }
  if (data.valid_until) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`Válido hasta: ${formatDate(data.valid_until)}`, 15, y);
    y += 5;
  }
  if (data.delivery_date) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`Fecha de entrega: ${formatDate(data.delivery_date)}`, 15, y);
    y += 5;
  }

  // Customer/Supplier info
  const party = data.customer || data.supplier;
  if (party) {
    y += 2;
    doc.setFillColor(...COLORS.lightBg);
    doc.roundedRect(15, y - 3, pageWidth - 30, data.customer ? 20 : 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textDark);
    const partyLabel = data.customer ? 'Cliente' : 'Proveedor';
    doc.text(partyLabel, 20, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.text(party.name, 20, y + 7);
    if (party.tax_id) {
      doc.text(`RUT: ${party.tax_id}`, 20, y + 12);
    }
    if (data.customer && party.address) {
      doc.text(party.address, 20, y + 17);
    }
    if (data.supplier && party.phone) {
      doc.text(`Tel: ${party.phone}`, pageWidth - 20, y + 7, { align: 'right' });
    }
    y += data.customer ? 24 : 16;
  }

  return y;
}

function buildItemsTable(doc: jsPDF, data: DocumentData, startY: number): number {
  const isPriceDocument = data.type === 'cotizacion' || data.type === 'orden_venta' || data.type === 'orden_compra' || data.type === 'boleta';

  const head = isPriceDocument
    ? [['#', 'Producto', 'SKU', 'Cant.', 'P. Unit.', 'Dto%', 'Total']]
    : [['#', 'Producto', 'SKU', 'Cant.', 'Observación']];

  const body = data.items.map((item, i) => {
    if (isPriceDocument) {
      return [
        String(i + 1),
        item.name,
        item.sku || '—',
        String(item.quantity),
        formatCurrency(item.unit_price),
        item.discount ? `${item.discount}%` : '—',
        formatCurrency(item.total),
      ];
    }
    return [String(i + 1), item.name, item.sku || '—', String(item.quantity), '—'];
  });

  const columnStyles: Record<string, object> = {
    0: { halign: 'center', cellWidth: 10 },
    1: { cellWidth: isPriceDocument ? 55 : 70 },
    2: { cellWidth: 30 },
    3: { halign: 'center', cellWidth: 15 },
  };

  if (isPriceDocument) {
    columnStyles[4] = { halign: 'right', cellWidth: 28 };
    columnStyles[5] = { halign: 'center', cellWidth: 15 };
    columnStyles[6] = { halign: 'right', cellWidth: 30 };
  }

  autoTable(doc, {
    startY,
    head,
    body,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.textDark,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightBg,
    },
    columnStyles,
    margin: { left: 15, right: 15 },
  });

  return (doc as any).lastAutoTable.finalY;
}

function buildTotalsBlock(doc: jsPDF, data: DocumentData, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const totalsX = pageWidth - 80;

  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);

  doc.text('Subtotal:', totalsX, y);
  doc.text(formatCurrency(data.subtotal), pageWidth - 15, y, { align: 'right' });
  y += 6;

  doc.text('IVA (19%):', totalsX, y);
  doc.text(formatCurrency(data.tax_amount), pageWidth - 15, y, { align: 'right' });
  y += 6;

  // Separator
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(totalsX, y - 2, pageWidth - 15, y - 2);
  y += 2;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textDark);
  doc.text('TOTAL:', totalsX, y);
  doc.text(formatCurrency(data.total), pageWidth - 15, y, { align: 'right' });
  y += 8;

  // Payment info for boletas
  if (data.type === 'boleta' && data.payment_method) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`Forma de pago: ${data.payment_method}`, totalsX, y);
    y += 5;
  }

  return y;
}

function buildNotes(doc: jsPDF, data: DocumentData, y: number): number {
  if (!data.notes) return y;
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textDark);
  doc.text('Notas:', 15, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  const lines = doc.splitTextToSize(data.notes, doc.internal.pageSize.getWidth() - 30);
  doc.text(lines, 15, y);
  y += lines.length * 4;
  return y;
}

function buildFooter(doc: jsPDF, data: { id: string; type: string }): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Separator
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

  // Footer text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Documento generado por Yellow ERP', 15, pageHeight - 14);
  doc.text(`Verificar: ${BASE_URL}/view/${getDocTypeRoute(data.type)}/${data.id}`, pageWidth - 15, pageHeight - 14, { align: 'right' });
}

export async function generateBoletaPDF(data: DocumentData): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const y = await buildDocumentHeader(doc, data);
  const tableY = buildItemsTable(doc, data, y);
  const totalsY = buildTotalsBlock(doc, data, tableY);
  buildNotes(doc, data, totalsY);
  buildFooter(doc, data);
  return doc;
}

export async function generateCotizacionPDF(data: DocumentData): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const y = await buildDocumentHeader(doc, data);
  const tableY = buildItemsTable(doc, data, y);
  const totalsY = buildTotalsBlock(doc, data, tableY);
  buildNotes(doc, data, totalsY);
  buildFooter(doc, data);
  return doc;
}

export async function generateOrdenVentaPDF(data: DocumentData): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = await buildDocumentHeader(doc, data);

  // Payment terms / Delivery info
  if (data.payment_terms || data.warehouse) {
    y += 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    if (data.payment_terms) { doc.text(`Plazo de pago: ${data.payment_terms} días`, 15, y); y += 5; }
    if (data.warehouse) { doc.text(`Bodega: ${data.warehouse}`, 15, y); y += 5; }
    y += 2;
  }

  const tableY = buildItemsTable(doc, data, y);
  const totalsY = buildTotalsBlock(doc, data, tableY);
  buildNotes(doc, data, totalsY);
  buildFooter(doc, data);
  return doc;
}

export async function generateOrdenCompraPDF(data: DocumentData): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = await buildDocumentHeader(doc, data);

  if (data.payment_terms) {
    y += 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`Plazo de pago: ${data.payment_terms} días`, 15, y);
    y += 7;
  }

  const tableY = buildItemsTable(doc, data, y);
  const totalsY = buildTotalsBlock(doc, data, tableY);
  buildNotes(doc, data, totalsY);
  buildFooter(doc, data);
  return doc;
}

export interface ReturnNoteData {
  id: string;
  number: string;
  date: string;
  company: CompanyData;
  customer?: { name: string; tax_id?: string; address?: string };
  items: DocumentItem[];
  reason?: string;
  condition?: string;
  notes?: string;
}

export async function generateReturnNotePDF(data: ReturnNoteData): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = await buildDocumentHeader(doc, {
    ...data,
    type: 'boleta',
    subtotal: data.items.reduce((sum, item) => sum + item.total, 0),
    tax_amount: 0,
    total: data.items.reduce((sum, item) => sum + item.total, 0),
  });

  // Return-specific info
  if (data.reason) {
    y += 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`Motivo: ${data.reason}`, 15, y);
    y += 4;
  }
  if (data.condition) {
    doc.text(`Condición: ${data.condition}`, 15, y);
    y += 4;
  }

  const tableY = buildItemsTable(doc, {
    ...data,
    type: 'boleta',
    subtotal: data.items.reduce((sum, item) => sum + item.total, 0),
    tax_amount: 0,
    total: data.items.reduce((sum, item) => sum + item.total, 0),
  }, y);

  if (data.notes) {
    y = tableY + 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Notas:', 15, y);
    y += 4;
    doc.setFontSize(7);
    const noteLines = doc.splitTextToSize(data.notes, 180);
    doc.text(noteLines, 15, y);
  }

  buildFooter(doc, { ...data, type: 'boleta' });
  return doc;
}

export interface DeliveryGuideData {
  id: string;
  number: string;
  type: 'guia_despacho';
  date: string;
  company: CompanyData;
  customer?: { name: string; rut?: string; address?: string };
  items: (DocumentItem & { unit?: string; description?: string })[];
  transport?: string;
  driver?: string;
  plate?: string;
  notes?: string;
  shipping_date?: string;
}

export async function generateDeliveryGuidePDF(data: DeliveryGuideData): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const logoDataUrl = data.company.logo_url ? await fetchLogoAsDataUrl(data.company.logo_url) : null;

  // Header
  let y = 18;
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, 'PNG', 15, y - 6, 12, 12); } catch {}
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.primary);
  doc.text(data.company.name || 'Empresa', 30, y);
  y += 8;

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textMuted);
  const companyDetails: string[] = [];
  if (data.company.tax_id) companyDetails.push(`RUT: ${data.company.tax_id}`);
  if (data.company.address) companyDetails.push(data.company.address);
  if (data.company.phone) companyDetails.push(`Tel: ${data.company.phone}`);
  doc.text(companyDetails.join(' | '), 30, y);
  y += 8;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primary);
  doc.text('GUÍA DE DESPACHO', 15, y);
  y += 5;

  // Document badge + info
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(15, y, 30, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255);
  doc.text(data.number || 'Sin número', 30, y + 5.5, { align: 'center' });
  y += 13;

  doc.setTextColor(...COLORS.textDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Fecha de emisión: ${data.date}`, 15, y); y += 4;
  if (data.shipping_date) { doc.text(`Fecha de despacho: ${data.shipping_date}`, 15, y); y += 4; }

  // Customer info
  if (data.customer) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CLIENTE', 15, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(data.customer.name, 15, y); y += 4;
    if (data.customer.rut) { doc.text(`RUT: ${data.customer.rut}`, 15, y); y += 4; }
    if (data.customer.address) { doc.text(`Dirección: ${data.customer.address}`, 15, y); y += 4; }
  }

  // Items table
  y += 3;
  const body = data.items.map(item => [
    item.name,
    item.sku || '-',
    String(item.quantity),
    item.unit || 'Unidad',
    item.description || '-',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Producto', 'SKU', 'Cant.', 'Unidad', 'Observación']],
    body,
    theme: 'grid',
    headStyles: { fillColor: COLORS.accent, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: COLORS.textDark },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 30 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 25 },
      4: { cellWidth: 'auto' },
    },
    margin: { left: 15, right: 15 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Transport info
  if (data.transport || data.driver || data.plate) {
    doc.setFillColor(...COLORS.lightBg);
    doc.roundedRect(15, y, 180, 22, 2, 2, 'F');
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(15, y, 180, 22, 2, 2, 'S');

    let ty = y + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textDark);
    doc.text('TRANSPORTE', 20, ty);
    ty += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    if (data.transport) { doc.text(`Transportista: ${data.transport}`, 20, ty); ty += 4; }
    if (data.driver) { doc.text(`Chofer: ${data.driver}`, 20, ty); ty += 4; }
    if (data.plate) { doc.text(`Patente: ${data.plate}`, 20, ty); }
    y += 26;
  }

  // Notes
  if (data.notes) {
    y += 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Notas:', 15, y);
    y += 4;
    doc.setFontSize(7);
    const noteLines = doc.splitTextToSize(data.notes, 180);
    doc.text(noteLines, 15, y);
  }

  buildFooter(doc, data);
  return doc;
}

export interface POSVoucherData {
  id: string;
  number: string;
  type: 'boleta' | 'factura';
  date: string;
  company: CompanyData;
  customer?: { name: string; rut?: string };
  items: { name: string; quantity: number; unit_price: number; total: number }[];
  subtotal: number;
  tax_amount: number;
  total: number;
  payment_method: string;
  card_transaction_number?: string;
  amount_paid?: number;
  change?: number;
}

export function generatePOSVoucher(data: POSVoucherData): jsPDF {
  const pageWidth = 80;
  const margin = 5;
  const contentWidth = pageWidth - margin * 2;
  const doc = new jsPDF({ unit: 'mm', format: [pageWidth, 200] });

  let y = 8;
  const center = (text: string, yPos: number, fontSize: number, bold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(text, pageWidth / 2, yPos, { align: 'center' });
  };
  const line = (text: string, yPos: number, fontSize: number, bold = false, align: 'left' | 'center' | 'right' = 'left') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(text, align === 'center' ? pageWidth / 2 : margin, yPos, { align });
  };
  const dashedLine = (yPos: number) => {
    doc.setDrawColor(180);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    doc.setLineDashPattern([], 0);
  };

  center(data.company.name || 'Empresa', y, 11, true);
  y += 5;
  if (data.company.tax_id) { center(`RUT: ${data.company.tax_id}`, y, 7); y += 4; }
  if (data.company.address) { center(data.company.address, y, 6); y += 3.5; }
  if (data.company.phone) { center(`Tel: ${data.company.phone}`, y, 6); y += 3.5; }
  y += 2;
  dashedLine(y);
  y += 5;

  const docTypeLabel = data.type === 'boleta' ? 'BOLETA' : 'FACTURA';
  center(docTypeLabel, y, 12, true);
  y += 6;
  center(`Nº ${data.number}`, y, 9, true);
  y += 5;
  center(`Fecha: ${data.date}`, y, 7);
  y += 5;
  dashedLine(y);
  y += 5;

  if (data.customer) {
    line('CLIENTE:', y, 7, true);
    y += 4;
    line(data.customer.name, y, 7);
    y += 4;
    if (data.customer.rut) {
      line(`RUT: ${data.customer.rut}`, y, 7);
      y += 4;
    }
    dashedLine(y);
    y += 5;
  }

  line('DETALLE', y, 7, true);
  y += 5;

  for (const item of data.items) {
    const qtyStr = `${item.quantity}x`;
    const nameStr = item.name.length > 18 ? item.name.substring(0, 16) + '..' : item.name;
    const priceStr = `$${(item.total || 0).toLocaleString('es-CL')}`;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(qtyStr, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(nameStr, margin + 10, y);
    doc.text(priceStr, pageWidth - margin, y, { align: 'right' });
    y += 3.5;

    doc.setFontSize(5.5);
    doc.setTextColor(120);
    doc.text(`  $${(item.unit_price || 0).toLocaleString('es-CL')} c/u`, margin + 10, y);
    doc.setTextColor(0);
    y += 4;
  }

  dashedLine(y);
  y += 5;

  line('Subtotal:', y, 7);
  line(`$${(data.subtotal || 0).toLocaleString('es-CL')}`, y, 7, false, 'right');
  y += 4;
  line('IVA (19%):', y, 7);
  line(`$${(data.tax_amount || 0).toLocaleString('es-CL')}`, y, 7, false, 'right');
  y += 5;
  dashedLine(y);
  y += 5;
  line('TOTAL:', y, 9, true);
  line(`$${(data.total || 0).toLocaleString('es-CL')}`, y, 9, true, 'right');
  y += 6;
  dashedLine(y);
  y += 5;

  const paymentLabels: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
  };
  line('PAGO:', y, 7, true);
  y += 4;
  line(paymentLabels[data.payment_method] || data.payment_method, y, 7);
  y += 4;
  if (data.card_transaction_number) {
    line('N° Transacción:', y, 7);
    line(data.card_transaction_number, y, 7, false, 'right');
    y += 4;
  }
  if (data.amount_paid) {
    line('Recibido:', y, 7);
    line(`$${(data.amount_paid || 0).toLocaleString('es-CL')}`, y, 7, false, 'right');
    y += 4;
  }
  if (data.change !== undefined && data.change > 0) {
    line('Vuelto:', y, 7);
    line(`$${(data.change || 0).toLocaleString('es-CL')}`, y, 7, false, 'right');
    y += 4;
  }
  y += 2;
  dashedLine(y);
  y += 6;

  center('¡Gracias por su compra!', y, 8, true);
  y += 4;
  center(data.company.name || '', y, 6);

  return doc;
}

export interface BarcodeLabelData {
  name: string;
  sku: string;
  barcode?: string;
  price?: number;
  unit_of_measure?: string;
  image_url?: string;
}

export type LabelTemplate = 'small' | 'medium' | 'large';

const LABEL_TEMPLATES = {
  small: { width: 45, height: 30, fontSize: 6, barcodeHeight: 14, showImage: false },
  medium: { width: 62, height: 40, fontSize: 8, barcodeHeight: 20, showImage: false },
  large: { width: 90, height: 55, fontSize: 9, barcodeHeight: 22, showImage: true },
};

export function generateBarcodeLabelsPDF(labels: BarcodeLabelData[], template: LabelTemplate = 'medium'): jsPDF {
  const t = LABEL_TEMPLATES[template];
  const labelWidth = t.width;
  const labelHeight = t.height;
  const margin = 10;
  const spacing = 4;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;

  let x = margin;
  let y = margin;

  for (const label of labels) {
    if (x + labelWidth > pageWidth - margin) {
      x = margin;
      y += labelHeight + spacing;
    }
    if (y + labelHeight > pageHeight - margin) {
      doc.addPage();
      x = margin;
      y = margin;
    }

    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.rect(x, y, labelWidth, labelHeight);

    doc.setFontSize(t.fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text(label.name, x + 2, y + t.fontSize + 1, { maxWidth: labelWidth - 4 });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(t.fontSize - 1);
    doc.text(`SKU: ${label.sku}`, x + 2, y + labelHeight - t.barcodeHeight - 3);

    if (label.price) {
      doc.text(`$${label.price.toLocaleString('es-CL')}`, x + labelWidth - 2, y + labelHeight - t.barcodeHeight - 3, { align: 'right' });
    }

    try {
      const canvas = document.createElement('canvas');
      const barcodeValue = label.barcode || label.sku;
      JsBarcode(canvas, barcodeValue, {
        format: 'CODE128',
        width: 1.2,
        height: t.barcodeHeight - 4,
        displayValue: false,
        margin: 0,
      });
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', x + 2, y + labelHeight - t.barcodeHeight, labelWidth - 4, t.barcodeHeight - 4);
    } catch {}

    x += labelWidth + spacing;
  }

  return doc;
}

// ══════════════════════════════════════════
// BOLETA DE PAGO (Payslip) - Chilean Legal Document
// ══════════════════════════════════════════

export function generatePayslipPDF(data: PayslipData): jsPDF {
  const doc = new jsPDF('p', 'mm', 'letter');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // ── Header ──
  // Company logo
  if (data.company.logo_url) {
    try {
      doc.addImage(data.company.logo_url, 'PNG', margin, y, 25, 25);
    } catch {}
  }

  // Company info
  const companyX = data.company.logo_url ? margin + 30 : margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primary);
  doc.text(data.company.razon_social || data.company.name || '', companyX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  let infoY = y + 11;
  if (data.company.tax_id) { doc.text(`RUT: ${data.company.tax_id}`, companyX, infoY); infoY += 4; }
  if (data.company.giro) { doc.text(`Giro: ${data.company.giro}`, companyX, infoY); infoY += 4; }
  if (data.company.address) { doc.text(`Dirección: ${data.company.address}`, companyX, infoY); infoY += 4; }
  if (data.company.city) { doc.text(`${data.company.city}, ${data.company.region || ''}`, companyX, infoY); infoY += 4; }

  // Document title
  y += 32;
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('BOLETA DE PAGO', pageWidth / 2, y + 7, { align: 'center' });

  // Period info
  y += 15;
  doc.setTextColor(...COLORS.textDark);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Período: ${data.period.label}`, margin, y);
  doc.text(`${data.period.start_date} al ${data.period.end_date}`, pageWidth - margin, y, { align: 'right' });

  // ── Employee Info ──
  y += 10;
  doc.setFillColor(...COLORS.lightBg);
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'F');

  const col1X = margin + 5;
  const col2X = margin + contentWidth / 2 + 5;
  let empY = y + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('EMPLEADO', col1X, empY);
  doc.text('DATOS LABORALES', col2X, empY);

  empY += 5;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textDark);
  doc.text(`${data.employee.first_name} ${data.employee.last_name}`, col1X, empY);
  doc.text(`Cargo: ${data.employee.position || '—'}`, col2X, empY);

  empY += 5;
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`RUT: ${data.employee.rut || '—'}`, col1X, empY);
  doc.text(`Depto: ${data.employee.department || '—'}`, col2X, empY);

  empY += 5;
  doc.text(`Contrato: ${data.employee.contract_type || '—'}`, col1X, empY);
  doc.text(`Ingreso: ${data.employee.hire_date || '—'}`, col2X, empY);

  empY += 5;
  doc.text(`AFP: ${data.employee.afp_fund || '—'}`, col1X, empY);
  doc.text(`Salud: ${data.employee.health_type === 'isapre' ? 'Isapre' : 'FONASA'}`, col2X, empY);

  // ── Earnings Table ──
  y += 35;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.accent);
  doc.text('HABERES', margin, y);
  y += 3;

  const earningsRows = data.earnings.map(e => [
    e.concept,
    e.quantity ? `${e.quantity}` : '1',
    e.unit_value ? formatCurrency(e.unit_value) : '—',
    formatCurrency(e.amount),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Concepto', 'Cantidad', 'Valor Unitario', 'Monto']],
    body: earningsRows,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2, textColor: COLORS.textDark },
    headStyles: { fillColor: [241, 245, 249], textColor: COLORS.textMuted, fontStyle: 'bold', fontSize: 7 },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.45 },
      1: { cellWidth: contentWidth * 0.15, halign: 'center' },
      2: { cellWidth: contentWidth * 0.2, halign: 'right' },
      3: { cellWidth: contentWidth * 0.2, halign: 'right', fontStyle: 'bold' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // ── Deductions Table ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(220, 38, 38);
  doc.text('DESCUENTOS', margin, y);
  y += 3;

  const deductionsRows = data.deductions.map(d => [
    d.concept,
    formatCurrency(d.amount),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Concepto', 'Monto']],
    body: deductionsRows,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2, textColor: COLORS.textDark },
    headStyles: { fillColor: [254, 226, 226], textColor: [153, 27, 27], fontStyle: 'bold', fontSize: 7 },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.7 },
      1: { cellWidth: contentWidth * 0.3, halign: 'right', fontStyle: 'bold' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // ── Employer Contributions Table ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.accent);
  doc.text('CARGAS DEL EMPLEADOR', margin, y);
  y += 3;

  const employerRows = data.employerContributions.map(c => [
    c.concept,
    formatCurrency(c.amount),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Concepto', 'Monto']],
    body: employerRows,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2, textColor: COLORS.textDark },
    headStyles: { fillColor: [238, 242, 255], textColor: [55, 48, 163], fontStyle: 'bold', fontSize: 7 },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.7 },
      1: { cellWidth: contentWidth * 0.3, halign: 'right', fontStyle: 'bold' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Totals Summary ──
  if (y + 40 > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }

  doc.setFillColor(...COLORS.lightBg);
  doc.roundedRect(margin, y, contentWidth, 35, 2, 2, 'F');

  const totCol1 = margin + 5;
  const totCol2 = margin + contentWidth / 2 + 5;
  let totY = y + 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.textDark);

  doc.text('Total Haberes:', totCol1, totY);
  doc.text(formatCurrency(data.totals.gross), totCol2, totY, { align: 'right' });

  totY += 7;
  doc.setTextColor(220, 38, 38);
  doc.text('Total Descuentos:', totCol1, totY);
  doc.text(formatCurrency(data.totals.total_deductions + data.totals.total_tax), totCol2, totY, { align: 'right' });

  totY += 7;
  doc.setTextColor(...COLORS.accent);
  doc.text('Cargas Empleador:', totCol1, totY);
  doc.text(formatCurrency(data.totals.total_employer), totCol2, totY, { align: 'right' });

  totY += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('LÍQUIDO A PAGAR:', totCol1, totY);
  doc.text(formatCurrency(data.totals.net_pay), totCol2, totY, { align: 'right' });

  // ── Footer ──
  y = pageHeight - margin - 15;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  y += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Documento generado por Yellow ERP — Este documento no reemplaza la boleta de honorarios tributaria.', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CL')}`, pageWidth / 2, y, { align: 'center' });

  return doc;
}

const terminationTypeLabels: Record<string, string> = {
  despido_sin_causa: 'Despido sin Causa',
  despido_con_causa: 'Despido con Causa',
  renuncia: 'Renuncia Voluntaria',
  mutuo_acuerdo: 'Mutuo Acuerdo',
};

export function generateLiquidationPDF(data: LiquidationData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');

  if (data.company.logo_url) {
    try { doc.addImage(data.company.logo_url, 'JPEG', 15, 8, 20, 20); } catch {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.company.razon_social || 'Empresa', 40, 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`RUT: ${data.company.tax_id || ''}`, 40, 21);
  if (data.company.giro) doc.text(`Giro: ${data.company.giro}`, 40, 26);
  if (data.company.address) doc.text(data.company.address, 40, 31);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('LIQUIDACION DE REMUNERACIONES', pageWidth - 15, 15, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tipo: ${terminationTypeLabels[data.termination_type] || data.termination_type}`, pageWidth - 15, 22, { align: 'right' });
  doc.text(`Fecha: ${data.termination_date}`, pageWidth - 15, 28, { align: 'right' });

  y = 50;

  // Employee Info
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, pageWidth - 30, 30, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  y += 8;
  doc.text('EMPLEADO', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.employee_name, 20, y + 6);
  doc.text(`RUT: ${data.employee_rut}`, 20, y + 12);
  doc.text(`Cargo: ${data.position}`, 110, y);
  doc.text(`Depto: ${data.department}`, 110, y + 6);
  doc.text(`Contrato: ${data.contract_type}`, 110, y + 12);
  doc.text(`Ingreso: ${data.hire_date}`, 20, y + 18);
  doc.text(`Antigüedad: ${data.years_of_service} años`, 110, y + 18);
  doc.text(`Sueldo Base: $${data.base_salary.toLocaleString('es-CL')}`, 20, y + 24);

  y += 40;

  // Items grouped by category
  const groups = [
    { label: 'HABERES', items: data.items.filter(i => i.category === 'earnings'), color: [240, 253, 244] as [number, number, number] },
    { label: 'INDEMNIZACIONES', items: data.items.filter(i => i.category === 'severance'), color: [238, 242, 255] as [number, number, number] },
    { label: 'COMPENSACIONES', items: data.items.filter(i => i.category === 'compensation'), color: [255, 251, 235] as [number, number, number] },
    { label: 'CARGAS POR AVISO', items: data.items.filter(i => i.category === 'notice'), color: [255, 241, 242] as [number, number, number] },
  ];

  for (const group of groups) {
    if (group.items.length === 0) continue;

    doc.setFillColor(...group.color);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(group.label, 15, y + 5);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['Codigo', 'Concepto', 'Monto']],
      body: group.items.map(item => [
        item.code,
        item.concept,
        `$${item.amount.toLocaleString('es-CL')}`,
      ]),
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [100, 116, 139], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: group.color },
      columnStyles: {
        0: { cellWidth: 25 },
        2: { halign: 'right', cellWidth: 35 },
      },
      margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // Totals summary
  y += 5;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(15, y, pageWidth - 30, 42, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  y += 8;
  doc.text('RESUMEN', 20, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  y += 7;
  doc.text('Total Haberes:', 20, y);
  doc.text(`$${data.totals.earnings.toLocaleString('es-CL')}`, pageWidth - 20, y, { align: 'right' });
  y += 6;
  doc.text('Indemnizaciones:', 20, y);
  doc.text(`$${data.totals.severance.toLocaleString('es-CL')}`, pageWidth - 20, y, { align: 'right' });
  y += 6;
  doc.text('Compensaciones:', 20, y);
  doc.text(`$${data.totals.compensation.toLocaleString('es-CL')}`, pageWidth - 20, y, { align: 'right' });
  y += 6;
  doc.text('Cargas Aviso:', 20, y);
  doc.text(`$${data.totals.notice.toLocaleString('es-CL')}`, pageWidth - 20, y, { align: 'right' });
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('LIQUIDO A PAGAR:', 20, y);
  doc.text(`$${data.totals.net_total.toLocaleString('es-CL')}`, pageWidth - 20, y, { align: 'right' });

  y += 20;

  // Signatures
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const sigWidth = 60;
  const sigLeft = pageWidth / 2 - sigWidth - 10;
  const sigRight = pageWidth / 2 + 10;

  doc.line(sigLeft, y, sigLeft + sigWidth, y);
  doc.text('Firma Empleado', sigLeft + sigWidth / 2, y + 5, { align: 'center' });
  doc.text(`RUT: ${data.employee_rut}`, sigLeft + sigWidth / 2, y + 10, { align: 'center' });

  doc.line(sigRight, y, sigRight + sigWidth, y);
  doc.text('Firma Empleador', sigRight + sigWidth / 2, y + 5, { align: 'center' });
  doc.text(`RUT: ${data.company.tax_id || ''}`, sigRight + sigWidth / 2, y + 10, { align: 'center' });

  y += 18;

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Documento generado por Yellow ERP — Liquidacion de remuneraciones segun Codigo del Trabajo chileno.', pageWidth / 2, y, { align: 'center' });
  y += 3;
  doc.text(`Fecha de emision: ${new Date().toLocaleDateString('es-CL')}`, pageWidth / 2, y, { align: 'center' });

  return doc;
}
