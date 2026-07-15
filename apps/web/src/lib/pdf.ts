import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

interface DocumentItem {
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  tax_rate?: number;
  total: number;
}

interface CompanyInfo {
  name: string;
  rut?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface DocumentData {
  number: string;
  date: string;
  due_date?: string;
  company: CompanyInfo;
  customer?: { name: string; rut?: string; address?: string; phone?: string };
  supplier?: { name: string; rut?: string; address?: string; phone?: string };
  items: DocumentItem[];
  subtotal: number;
  tax_amount: number;
  total: number;
  notes?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
}

function addHeader(doc: jsPDF, data: DocumentData, docType: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Company info
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.company.name, 14, 20);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  if (data.company.rut) doc.text(`RUT: ${data.company.rut}`, 14, 26);
  if (data.company.address) doc.text(data.company.address, 14, 31);
  if (data.company.phone) doc.text(`Tel: ${data.company.phone}`, 14, 36);
  if (data.company.email) doc.text(data.company.email, 14, 41);
  
  doc.setTextColor(0);
  
  // Document type and number
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(docType, pageWidth - 14, 20, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº ${data.number}`, pageWidth - 14, 27, { align: 'right' });
  doc.text(`Fecha: ${data.date}`, pageWidth - 14, 33, { align: 'right' });
  if (data.due_date) {
    doc.text(`Vencimiento: ${data.due_date}`, pageWidth - 14, 39, { align: 'right' });
  }
  
  // Customer/Supplier info
  const party = data.customer || data.supplier;
  if (party) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const label = data.customer ? 'Cliente' : 'Proveedor';
    doc.text(label, 14, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(party.name, 14, 58);
    if (party.rut) doc.text(`RUT: ${party.rut}`, 14, 64);
    if (party.address) doc.text(party.address, 14, 70);
    if (party.phone) doc.text(`Tel: ${party.phone}`, 14, 76);
  }
}

export function generateInvoicePDF(data: DocumentData): void {
  const doc = new jsPDF();
  
  addHeader(doc, data, 'FACTURA');
  
  // Items table
  const tableStartY = 82;
  const body = data.items.map(item => [
    item.name,
    item.sku,
    item.quantity.toString(),
    formatCurrency(item.unit_price),
    item.discount ? `${item.discount}%` : '-',
    formatCurrency(item.total),
  ]);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Producto', 'SKU', 'Cant.', 'P. Unit.', 'Desc.', 'Total']],
    body,
    theme: 'grid',
    headStyles: { fillColor: [30, 30, 30], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 60 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Totals
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', pageWidth - 80, finalY);
  doc.text(formatCurrency(data.subtotal), pageWidth - 14, finalY, { align: 'right' });
  
  doc.text('IVA (19%):', pageWidth - 80, finalY + 6);
  doc.text(formatCurrency(data.tax_amount), pageWidth - 14, finalY + 6, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', pageWidth - 80, finalY + 14);
  doc.text(formatCurrency(data.total), pageWidth - 14, finalY + 14, { align: 'right' });
  
  // Notes
  if (data.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Notas:', 14, finalY + 24);
    doc.text(data.notes, 14, finalY + 30);
  }
  
  doc.save(`${data.number}.pdf`);
}

export function generateDeliveryGuidePDF(data: DocumentData & { transport?: string; driver?: string; plate?: string }): void {
  const doc = new jsPDF();
  
  addHeader(doc, data, 'GUIA DE DESPACHO');
  
  const tableStartY = 82;
  const body = data.items.map(item => [
    item.name,
    item.sku,
    item.quantity.toString(),
    item.name,
  ]);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Producto', 'SKU', 'Cant.', 'Observacion']],
    body,
    theme: 'grid',
    headStyles: { fillColor: [30, 30, 30], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  if (data.transport) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Transportista: ${data.transport}`, 14, finalY);
    if (data.driver) doc.text(`Chofer: ${data.driver}`, 14, finalY + 5);
    if (data.plate) doc.text(`Patente: ${data.plate}`, 14, finalY + 10);
  }
  
  doc.save(`${data.number}.pdf`);
}

export function generateQuotationPDF(data: DocumentData): void {
  const doc = new jsPDF();
  
  addHeader(doc, data, 'COTIZACION');
  
  if (data.due_date) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Válida hasta: ${data.due_date}`, 14, 48);
  }
  
  const tableStartY = 82;
  const body = data.items.map(item => [
    item.name,
    item.sku,
    item.quantity.toString(),
    formatCurrency(item.unit_price),
    item.discount ? `${item.discount}%` : '-',
    formatCurrency(item.total),
  ]);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Producto', 'SKU', 'Cant.', 'P. Unit.', 'Desc.', 'Total']],
    body,
    theme: 'grid',
    headStyles: { fillColor: [30, 30, 30], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 60 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', pageWidth - 80, finalY);
  doc.text(formatCurrency(data.subtotal), pageWidth - 14, finalY, { align: 'right' });
  
  doc.text('IVA (19%):', pageWidth - 80, finalY + 6);
  doc.text(formatCurrency(data.tax_amount), pageWidth - 14, finalY + 6, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', pageWidth - 80, finalY + 14);
  doc.text(formatCurrency(data.total), pageWidth - 14, finalY + 14, { align: 'right' });
  
  if (data.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Notas:', 14, finalY + 24);
    doc.text(data.notes, 14, finalY + 30);
  }
  
  doc.save(`${data.number}.pdf`);
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

export function generateBarcodeLabelsPDF(labels: BarcodeLabelData[], template: LabelTemplate = 'medium') {
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

  labels.forEach((label) => {
    if (y + labelHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      x = margin;
    }

    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(x, y, labelWidth, labelHeight, 2, 2);

    let contentY = y + 2;
    const maxNameLen = t.showImage ? 15 : 20;

    if (t.showImage && label.image_url) {
      try {
        doc.addImage(label.image_url, 'JPEG', x + 2, contentY, 12, 12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(t.fontSize);
        const nameTruncated = label.name.length > maxNameLen ? label.name.substring(0, maxNameLen - 2) + '...' : label.name;
        doc.text(nameTruncated, x + 16, contentY + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(t.fontSize - 2);
        doc.text(`SKU: ${label.sku}`, x + 16, contentY + 9);
        contentY += 14;
      } catch {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(t.fontSize);
        const nameTruncated = label.name.length > maxNameLen ? label.name.substring(0, maxNameLen - 2) + '...' : label.name;
        doc.text(nameTruncated, x + 2, contentY + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(t.fontSize - 2);
        doc.text(`SKU: ${label.sku}`, x + 2, contentY + 9);
        contentY += 14;
      }
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(t.fontSize);
      const nameTruncated = label.name.length > maxNameLen ? label.name.substring(0, maxNameLen - 2) + '...' : label.name;
      doc.text(nameTruncated, x + 2, contentY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(t.fontSize - 2);
      doc.text(`SKU: ${label.sku}`, x + 2, contentY + 10);
      contentY += 13;
    }

    if (label.barcode) {
      try {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, label.barcode, {
          format: 'CODE128',
          width: 1,
          height: t.barcodeHeight,
          displayValue: true,
          fontSize: t.fontSize - 1,
          margin: 0,
          background: 'transparent',
        });
        const imgData = canvas.toDataURL('image/png');
        const barcodeWidth = labelWidth - 4;
        const barcodeHeight = labelHeight - contentY + y - (label.price ? 6 : 2);
        doc.addImage(imgData, 'PNG', x + 2, contentY, barcodeWidth, Math.min(barcodeHeight, 16));
      } catch {
        doc.setFontSize(t.fontSize - 1);
        doc.text(label.barcode, x + 2, contentY + 5);
      }
    }

    if (label.price) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(t.fontSize);
      doc.text(`$${label.price.toLocaleString('es-CL')}`, x + 2, y + labelHeight - 3);
    }

    if (label.unit_of_measure) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.text(label.unit_of_measure, x + labelWidth - 2, y + labelHeight - 3, { align: 'right' });
    }

    x += labelWidth + spacing;
    if (x + labelWidth > pageWidth - margin) {
      x = margin;
      y += labelHeight + spacing;
    }
  });

  doc.save('etiquetas.pdf');
}

export interface POSVoucherData {
  invoice_number: string;
  document_type: 'boleta' | 'factura';
  date: string;
  company: CompanyInfo;
  customer?: { name: string; rut?: string };
  items: { name: string; quantity: number; unit_price: number; total: number }[];
  subtotal: number;
  tax_amount: number;
  total: number;
  payment_method: string;
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

  // Company header
  center(data.company.name || 'Empresa', y, 11, true);
  y += 5;
  if (data.company.rut) { center(`RUT: ${data.company.rut}`, y, 7); y += 4; }
  if (data.company.address) { center(data.company.address, y, 6); y += 3.5; }
  if (data.company.phone) { center(`Tel: ${data.company.phone}`, y, 6); y += 3.5; }
  y += 2;
  dashedLine(y);
  y += 5;

  // Document type and number
  const docTypeLabel = data.document_type === 'boleta' ? 'BOLETA' : 'FACTURA';
  center(docTypeLabel, y, 12, true);
  y += 6;
  center(`Nº ${data.invoice_number}`, y, 9, true);
  y += 5;
  center(`Fecha: ${data.date}`, y, 7);
  y += 5;
  dashedLine(y);
  y += 5;

  // Customer info (for facturas)
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

  // Items
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

    // Unit price sub-line
    doc.setFontSize(5.5);
    doc.setTextColor(120);
    doc.text(`  $${(item.unit_price || 0).toLocaleString('es-CL')} c/u`, margin + 10, y);
    doc.setTextColor(0);
    y += 4;
  }

  dashedLine(y);
  y += 5;

  // Totals
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

  // Payment info
  const paymentLabels: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
  };
  line('PAGO:', y, 7, true);
  y += 4;
  line(paymentLabels[data.payment_method] || data.payment_method, y, 7);
  y += 4;
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

  // Barcode
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, data.invoice_number, {
      format: 'CODE128',
      width: 1.2,
      height: 25,
      displayValue: false,
      margin: 0,
    });
    const imgData = canvas.toDataURL('image/png');
    const barcodeWidth = contentWidth;
    const barcodeHeight = 12;
    doc.addImage(imgData, 'PNG', margin, y, barcodeWidth, barcodeHeight);
    y += barcodeHeight + 2;
    center(data.invoice_number, y, 6);
    y += 5;
  } catch {
    center(data.invoice_number, y, 7);
    y += 5;
  }

  y += 3;
  dashedLine(y);
  y += 6;

  // Thank you message
  center('¡Gracias por su compra!', y, 8, true);
  y += 4;
  center('www.yellow-erp.cl', y, 6);

  // Adjust page height
  const finalHeight = y + 8;
  doc.setFontSize(7);

  return doc;
}
