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
}

export function generateBarcodeLabelsPDF(labels: BarcodeLabelData[]) {
  const labelWidth = 62;
  const labelHeight = 40;
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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const nameTruncated = label.name.length > 20 ? label.name.substring(0, 18) + '...' : label.name;
    doc.text(nameTruncated, x + 2, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`SKU: ${label.sku}`, x + 2, y + 11);

    if (label.barcode) {
      try {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, label.barcode, {
          format: 'CODE128',
          width: 1.2,
          height: 20,
          displayValue: true,
          fontSize: 7,
          margin: 0,
          background: 'transparent',
        });
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', x + 2, y + 13, labelWidth - 4, 16);
      } catch {
        doc.setFontSize(7);
        doc.text(label.barcode, x + 2, y + 20);
      }
    }

    if (label.price) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
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
