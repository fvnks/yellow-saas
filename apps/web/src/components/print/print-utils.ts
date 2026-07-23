export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-CL').format(num);
}

export function formatDate(date: string): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateShort(date: string): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatRut(rut: string): string {
  if (!rut) return '—';
  const clean = rut.replace(/[^0-9kK]/g, '');
  if (clean.length < 2) return rut;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

export interface PrintCompanyData {
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

export interface PrintItem {
  name: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  tax_rate?: number;
  total: number;
  description?: string;
  observation?: string;
}

export interface PrintDocumentData {
  id: string;
  number: string;
  type: string;
  date: string;
  due_date?: string;
  status?: string;
  company: PrintCompanyData;
  customer?: { name: string; tax_id?: string; address?: string; email?: string; phone?: string; city?: string; giro?: string };
  supplier?: { name: string; tax_id?: string; address?: string; phone?: string; email?: string; giro?: string };
  items: PrintItem[];
  subtotal: number;
  tax_amount: number;
  total: number;
  notes?: string;
  payment_terms?: number;
  delivery_date?: string;
  warehouse?: string;
  valid_until?: string;
  payment_method?: string;
  transport?: string;
  driver_name?: string;
  vehicle_plate?: string;
  shipping_address?: string;
  reason?: string;
  order_number?: string;
  reference_invoice?: string;
}

function buildBaseStyles(): string {
  return `
    @page { size: letter; margin: 15mm 12mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 10px; color: #1a1a1a; line-height: 1.4; }
    .print-container { max-width: 100%; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb; }
    .company-info { flex: 1; }
    .company-logo { max-height: 60px; max-width: 180px; object-fit: contain; margin-bottom: 8px; }
    .company-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 2px; }
    .company-detail { font-size: 9px; color: #6b7280; margin-bottom: 1px; }
    .doc-badge { text-align: right; }
    .doc-type { font-size: 18px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 1px; }
    .doc-number { font-size: 13px; font-weight: 600; color: #4b5563; margin-top: 4px; }
    .doc-date { font-size: 9px; color: #6b7280; margin-top: 4px; }
    .doc-status { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 8px; font-weight: 700; text-transform: uppercase; margin-top: 6px; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-draft { background: #f3f4f6; color: #374151; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .status-issued { background: #dbeafe; color: #1e40af; }
    .parties { display: flex; gap: 20px; margin-bottom: 20px; }
    .party-box { flex: 1; padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; }
    .party-label { font-size: 8px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .party-name { font-size: 11px; font-weight: 600; color: #111827; }
    .party-detail { font-size: 9px; color: #6b7280; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    thead th { background: #f3f4f6; border: 1px solid #e5e7eb; padding: 6px 8px; font-size: 8px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
    thead th.text-right { text-align: right; }
    thead th.text-center { text-align: center; }
    tbody td { border: 1px solid #e5e7eb; padding: 6px 8px; font-size: 9px; color: #374151; }
    tbody td.text-right { text-align: right; }
    tbody td.text-center { text-align: center; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 20px; }
    .totals-table { width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 9px; color: #6b7280; }
    .totals-row.total { border-top: 2px solid #111827; padding-top: 6px; margin-top: 4px; font-size: 12px; font-weight: 700; color: #111827; }
    .notes { margin-bottom: 20px; padding: 10px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; }
    .notes-label { font-size: 8px; font-weight: 700; color: #92400e; text-transform: uppercase; margin-bottom: 4px; }
    .notes-text { font-size: 9px; color: #78350f; }
    .transport-info { display: flex; gap: 20px; margin-bottom: 20px; padding: 10px 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; }
    .transport-label { font-size: 8px; font-weight: 700; color: #6b7280; text-transform: uppercase; }
    .transport-value { font-size: 10px; font-weight: 600; color: #1e40af; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
    .signatures { display: flex; justify-content: space-around; margin-top: 40px; }
    .signature-box { text-align: center; width: 200px; }
    .signature-line { border-top: 1px solid #374151; margin-top: 50px; padding-top: 6px; }
    .signature-label { font-size: 9px; color: #6b7280; font-weight: 600; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 60px; font-weight: 900; color: rgba(239,68,68,0.08); text-transform: uppercase; pointer-events: none; z-index: -1; letter-spacing: 8px; }
    .barcode { text-align: center; margin: 10px 0; }
    .barcode img { height: 40px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .info-row { display: flex; gap: 8px; margin-bottom: 3px; }
    .info-label { font-size: 8px; font-weight: 700; color: #9ca3af; min-width: 80px; }
    .info-value { font-size: 9px; color: #374151; }
    .terms { margin-top: 20px; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; }
    .terms-title { font-size: 9px; font-weight: 700; color: #374151; margin-bottom: 6px; }
    .terms-list { font-size: 8px; color: #6b7280; line-height: 1.6; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  `;
}

function buildCompanyHeader(company: PrintCompanyData): string {
  const logo = company.logo_url
    ? `<img src="${company.logo_url}" alt="Logo" class="company-logo" />`
    : `<div style="width:50px;height:50px;background:linear-gradient(135deg,#eab308,#f59e0b);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:22px;font-weight:bold;margin-bottom:8px;">${(company.name || 'E')[0]}</div>`;
  return `
    <div class="company-info">
      ${logo}
      <div class="company-name">${company.name || 'Empresa'}</div>
      ${company.razon_social ? `<div class="company-detail">Razón Social: ${company.razon_social}</div>` : ''}
      ${company.tax_id ? `<div class="company-detail">RUT: ${formatRut(company.tax_id)}</div>` : ''}
      ${company.giro ? `<div class="company-detail">Giro: ${company.giro}</div>` : ''}
      ${company.address ? `<div class="company-detail">${company.address}${company.city ? ', ' + company.city : ''}${company.region ? ', ' + company.region : ''}</div>` : ''}
      ${company.phone ? `<div class="company-detail">Tel: ${company.phone}</div>` : ''}
      ${company.email ? `<div class="company-detail">${company.email}</div>` : ''}
    </div>
  `;
}

function buildDocBadge(number: string, type: string, date: string, status?: string): string {
  const statusHtml = status ? `<div class="doc-status status-${status}">${status.toUpperCase()}</div>` : '';
  return `
    <div class="doc-badge">
      <div class="doc-type">${type}</div>
      <div class="doc-number">${number}</div>
      <div class="doc-date">${formatDate(date)}</div>
      ${statusHtml}
    </div>
  `;
}

function buildParties(customer?: PrintDocumentData['customer'], supplier?: PrintDocumentData['supplier'], date?: string): string {
  const dateStr = formatDateShort(date || '');
  if (customer) {
    return `
      <div class="parties">
        <div class="party-box">
          <div class="party-label">Cliente</div>
          <div class="party-name">${customer.name}</div>
          ${customer.tax_id ? `<div class="party-detail">RUT: ${formatRut(customer.tax_id)}</div>` : ''}
          ${customer.giro ? `<div class="party-detail">Giro: ${customer.giro}</div>` : ''}
          ${customer.address ? `<div class="party-detail">${customer.address}</div>` : ''}
          ${customer.city ? `<div class="party-detail">${customer.city}</div>` : ''}
          ${customer.email ? `<div class="party-detail">${customer.email}</div>` : ''}
          ${customer.phone ? `<div class="party-detail">Tel: ${customer.phone}</div>` : ''}
        </div>
        <div class="party-box" style="background:#f0fdf4;border-color:#bbf7d0;">
          <div class="party-label">Datos del Documento</div>
          <div class="info-row"><span class="info-label">Fecha:</span><span class="info-value">${dateStr}</span></div>
        </div>
      </div>
    `;
  }
  if (supplier) {
    return `
      <div class="parties">
        <div class="party-box">
          <div class="party-label">Proveedor</div>
          <div class="party-name">${supplier.name}</div>
          ${supplier.tax_id ? `<div class="party-detail">RUT: ${formatRut(supplier.tax_id)}</div>` : ''}
          ${supplier.giro ? `<div class="party-detail">Giro: ${supplier.giro}</div>` : ''}
          ${supplier.address ? `<div class="party-detail">${supplier.address}</div>` : ''}
          ${supplier.phone ? `<div class="party-detail">Tel: ${supplier.phone}</div>` : ''}
          ${supplier.email ? `<div class="party-detail">${supplier.email}</div>` : ''}
        </div>
        <div class="party-box" style="background:#f0fdf4;border-color:#bbf7d0;">
          <div class="party-label">Datos del Documento</div>
          <div class="info-row"><span class="info-label">Fecha:</span><span class="info-value">${dateStr}</span></div>
        </div>
      </div>
    `;
  }
  return '';
}

function buildItemsTable(items: PrintItem[], showDiscount = true, showTax = true): string {
  const discountCol = showDiscount ? '<th class="text-right">Desc.</th>' : '';
  const taxCol = showTax ? '<th class="text-right">IVA</th>' : '';
  const discountTd = showDiscount ? '<td class="text-right">${item.discount ? item.discount + "%" : "—"}</td>' : '';
  const taxTd = showTax ? `<td class="text-right">${'{item.tax_rate ? formatCurrency(item.quantity * item.unit_price * item.tax_rate / (100 + item.tax_rate)) : "—"}'}</td>` : '';

  let rows = '';
  items.forEach((item, i) => {
    const d = item.discount ? `<td class="text-right">${item.discount}%</td>` : (showDiscount ? '<td class="text-right">—</td>' : '');
    const t = showTax ? `<td class="text-right">${item.tax_rate ? formatCurrency(item.quantity * item.unit_price * item.tax_rate / (100 + item.tax_rate)) : '—'}</td>` : '';
    rows += `
      <tr>
        <td class="text-center">${i + 1}</td>
        <td>${item.name}${item.sku ? `<br><span style="color:#9ca3af;font-size:8px;">SKU: ${item.sku}</span>` : ''}</td>
        <td class="text-center">${formatNumber(item.quantity)}</td>
        <td class="text-right">${formatCurrency(item.unit_price)}</td>
        ${d}
        <td class="text-right" style="font-weight:600;">${formatCurrency(item.total)}</td>
        ${t}
      </tr>
    `;
  });

  const discountHeader = showDiscount ? '<th class="text-right">Desc.</th>' : '';
  const taxHeader = showTax ? '<th class="text-right">IVA</th>' : '';

  return `
    <table>
      <thead>
        <tr>
          <th class="text-center" style="width:30px;">#</th>
          <th>Descripción</th>
          <th class="text-center" style="width:50px;">Cant.</th>
          <th class="text-right" style="width:80px;">P. Unitario</th>
          ${discountHeader}
          <th class="text-right" style="width:90px;">Total</th>
          ${taxHeader}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildTotals(subtotal: number, tax_amount: number, total: number, showTax = true): string {
  const taxRow = showTax ? `<div class="totals-row"><span>IVA (19%)</span><span>${formatCurrency(tax_amount)}</span></div>` : '';
  return `
    <div class="totals">
      <div class="totals-table">
        <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
        ${taxRow}
        <div class="totals-row total"><span>TOTAL</span><span>${formatCurrency(total)}</span></div>
      </div>
    </div>
  `;
}

function buildNotes(notes?: string): string {
  if (!notes) return '';
  return `
    <div class="notes">
      <div class="notes-label">Observaciones</div>
      <div class="notes-text">${notes}</div>
    </div>
  `;
}

function buildSignatures(): string {
  return `
    <div class="signatures">
      <div class="signature-box">
        <div class="signature-line">
          <div class="signature-label">Entregado por</div>
        </div>
      </div>
      <div class="signature-box">
        <div class="signature-line">
          <div class="signature-label">Recibido por</div>
        </div>
      </div>
      <div class="signature-box">
        <div class="signature-line">
          <div class="signature-label">Conforme</div>
        </div>
      </div>
    </div>
  `;
}

function buildTransportInfo(transport?: string, driver?: string, plate?: string, address?: string): string {
  if (!transport && !driver && !plate && !address) return '';
  return `
    <div class="transport-info">
      ${transport ? `<div><div class="transport-label">Transporte</div><div class="transport-value">${transport}</div></div>` : ''}
      ${driver ? `<div><div class="transport-label">Chofer</div><div class="transport-value">${driver}</div></div>` : ''}
      ${plate ? `<div><div class="transport-label">Patente</div><div class="transport-value">${plate}</div></div>` : ''}
      ${address ? `<div style="flex:2;"><div class="transport-label">Dirección de Despacho</div><div class="transport-value">${address}</div></div>` : ''}
    </div>
  `;
}

function buildWatermark(text?: string): string {
  return text ? `<div class="watermark">${text}</div>` : '';
}

function wrapDocument(content: string, title: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${title}</title><style>${buildBaseStyles()}</style></head><body><div class="print-container">${content}</div></body></html>`;
}

export function openPrintWindow(html: string, title: string): void {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) { alert('Permitir ventanas emergentes para imprimir'); return; }
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.print(); }, 400);
}

export function generateInvoicePrint(data: PrintDocumentData): string {
  const isBoleta = data.type === 'boleta';
  const docTypeLabel = isBoleta ? 'BOLETA' : 'FACTURA ELECTRÓNICA';
  const showTax = !isBoleta;
  const watermark = data.status === 'cancelled' ? 'ANULADO' : undefined;

  const content = `
    ${buildWatermark(watermark)}
    <div class="header">
      ${buildCompanyHeader(data.company)}
      ${buildDocBadge(data.number, docTypeLabel, data.date, data.status)}
    </div>
    ${buildParties(data.customer, undefined, data.date)}
    ${buildItemsTable(data.items, true, showTax)}
    ${buildTotals(data.subtotal, data.tax_amount, data.total, showTax)}
    ${buildNotes(data.notes)}
    <div class="footer">
      <div class="two-col" style="font-size:8px;color:#6b7280;">
        <div>${data.payment_method ? `<strong>Forma de Pago:</strong> ${data.payment_method}` : ''}</div>
        <div style="text-align:right;">${data.due_date ? `<strong>Vencimiento:</strong> ${formatDateShort(data.due_date)}` : ''}</div>
      </div>
      ${buildSignatures()}
    </div>
  `;
  return wrapDocument(content, `${docTypeLabel} ${data.number}`);
}

export function generateDeliveryGuidePrint(data: PrintDocumentData): string {
  const content = `
    <div class="header">
      ${buildCompanyHeader(data.company)}
      ${buildDocBadge(data.number, 'GUÍA DE DESPACHO', data.date, data.status)}
    </div>
      ${buildParties(data.customer, undefined, data.date)}
    ${buildTransportInfo(data.transport, data.driver_name, data.vehicle_plate, data.shipping_address)}
    <table>
      <thead>
        <tr>
          <th class="text-center" style="width:30px;">#</th>
          <th>Descripción</th>
          <th class="text-center" style="width:50px;">Cant.</th>
          <th>Observación</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map((item, i) => `
          <tr>
            <td class="text-center">${i + 1}</td>
            <td>${item.name}${item.sku ? `<br><span style="color:#9ca3af;font-size:8px;">SKU: ${item.sku}</span>` : ''}</td>
            <td class="text-center">${formatNumber(item.quantity)}</td>
            <td>${item.observation || '—'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${buildNotes(data.notes)}
    ${buildSignatures()}
  `;
  return wrapDocument(content, `Guía de Despacho ${data.number}`);
}

export function generateCreditNotePrint(data: PrintDocumentData): string {
  const content = `
    <div class="header">
      ${buildCompanyHeader(data.company)}
      ${buildDocBadge(data.number, 'NOTA DE CRÉDITO', data.date, data.status)}
    </div>
      ${buildParties(data.customer, undefined, data.date)}
    ${data.reference_invoice ? `
      <div style="margin-bottom:16px;padding:8px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;">
        <span style="font-size:8px;font-weight:700;color:#991b1b;text-transform:uppercase;">Factura Ref:</span>
        <span style="font-size:10px;font-weight:600;color:#991b1b;margin-left:6px;">${data.reference_invoice}</span>
      </div>
    ` : ''}
    ${data.reason ? `
      <div style="margin-bottom:16px;padding:8px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;">
        <span style="font-size:8px;font-weight:700;color:#9a3412;text-transform:uppercase;">Motivo:</span>
        <span style="font-size:9px;color:#9a3412;margin-left:6px;">${data.reason}</span>
      </div>
    ` : ''}
    ${buildItemsTable(data.items, true, true)}
    ${buildTotals(data.subtotal, data.tax_amount, data.total, true)}
    ${buildNotes(data.notes)}
    <div class="footer">${buildSignatures()}</div>
  `;
  return wrapDocument(content, `Nota de Crédito ${data.number}`);
}

export function generateDebitNotePrint(data: PrintDocumentData): string {
  const content = `
    <div class="header">
      ${buildCompanyHeader(data.company)}
      ${buildDocBadge(data.number, 'NOTA DE DÉBITO', data.date, data.status)}
    </div>
    ${buildParties(data.customer, undefined, data.date)}
    ${data.reference_invoice ? `
      <div style="margin-bottom:16px;padding:8px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;">
        <span style="font-size:8px;font-weight:700;color:#991b1b;text-transform:uppercase;">Factura Ref:</span>
        <span style="font-size:10px;font-weight:600;color:#991b1b;margin-left:6px;">${data.reference_invoice}</span>
      </div>
    ` : ''}
    ${data.reason ? `
      <div style="margin-bottom:16px;padding:8px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;">
        <span style="font-size:8px;font-weight:700;color:#9a3412;text-transform:uppercase;">Motivo:</span>
        <span style="font-size:9px;color:#9a3412;margin-left:6px;">${data.reason}</span>
      </div>
    ` : ''}
    ${buildItemsTable(data.items, true, true)}
    ${buildTotals(data.subtotal, data.tax_amount, data.total, true)}
    ${buildNotes(data.notes)}
    <div class="footer">${buildSignatures()}</div>
  `;
  return wrapDocument(content, `Nota de Débito ${data.number}`);
}

export function generatePurchaseOrderPrint(data: PrintDocumentData): string {
  const content = `
    <div class="header">
      ${buildCompanyHeader(data.company)}
      ${buildDocBadge(data.number, 'ORDEN DE COMPRA', data.date, data.status)}
    </div>
    ${buildParties(undefined, data.supplier, data.date)}
    <div style="margin-bottom:16px;">
      <div class="two-col">
        <div class="info-row"><span class="info-label">Bodega:</span><span class="info-value">${data.warehouse || '—'}</span></div>
        <div class="info-row"><span class="info-label">Fecha Esperada:</span><span class="info-value">${data.delivery_date ? formatDateShort(data.delivery_date) : '—'}</span></div>
        <div class="info-row"><span class="info-label">Forma de Pago:</span><span class="info-value">${data.payment_method || '—'}</span></div>
        <div class="info-row"><span class="info-label">Plazo:</span><span class="info-value">${data.payment_terms ? data.payment_terms + ' días' : '—'}</span></div>
      </div>
    </div>
    ${buildItemsTable(data.items, true, true)}
    ${buildTotals(data.subtotal, data.tax_amount, data.total, true)}
    ${buildNotes(data.notes)}
    <div class="footer">${buildSignatures()}</div>
  `;
  return wrapDocument(content, `Orden de Compra ${data.number}`);
}

export function generateQuotationPrint(data: PrintDocumentData): string {
  const content = `
    <div class="header">
      ${buildCompanyHeader(data.company)}
      ${buildDocBadge(data.number, 'COTIZACIÓN', data.date, data.status)}
    </div>
    ${buildParties(data.customer, undefined, data.date)}
    ${data.valid_until ? `
      <div style="margin-bottom:16px;padding:8px 12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;">
        <span style="font-size:8px;font-weight:700;color:#1e40af;text-transform:uppercase;">Válido hasta:</span>
        <span style="font-size:10px;font-weight:600;color:#1e40af;margin-left:6px;">${formatDateShort(data.valid_until)}</span>
      </div>
    ` : ''}
    ${buildItemsTable(data.items, true, true)}
    ${buildTotals(data.subtotal, data.tax_amount, data.total, true)}
    ${buildNotes(data.notes)}
    <div class="footer">
      <div class="terms">
        <div class="terms-title">Términos y Condiciones</div>
        <div class="terms-list">
          1. Esta cotización tiene una vigencia de ${data.valid_until ? formatDateShort(data.valid_until) : '30 días'} desde la fecha de emisión.<br>
          2. Los precios incluyen IVA y están expresados en Pesos Chilenos (CLP).<br>
          3. El tiempo de entrega está sujeto a disponibilidad de stock.<br>
          4. Forma de pago: ${data.payment_method || 'A convenir'}.
        </div>
      </div>
      ${buildSignatures()}
    </div>
  `;
  return wrapDocument(content, `Cotización ${data.number}`);
}

export function generateSalesOrderPrint(data: PrintDocumentData): string {
  const content = `
    <div class="header">
      ${buildCompanyHeader(data.company)}
      ${buildDocBadge(data.number, 'ORDEN DE VENTA', data.date, data.status)}
    </div>
    ${buildParties(data.customer, undefined, data.date)}
    <div style="margin-bottom:16px;">
      <div class="two-col">
        <div class="info-row"><span class="info-label">Bodega:</span><span class="info-value">${data.warehouse || '—'}</span></div>
        <div class="info-row"><span class="info-label">Fecha Entrega:</span><span class="info-value">${data.delivery_date ? formatDateShort(data.delivery_date) : '—'}</span></div>
      </div>
    </div>
    ${buildItemsTable(data.items, true, true)}
    ${buildTotals(data.subtotal, data.tax_amount, data.total, true)}
    ${buildNotes(data.notes)}
    <div class="footer">${buildSignatures()}</div>
  `;
  return wrapDocument(content, `Orden de Venta ${data.number}`);
}

export function generateGoodsReceiptPrint(data: PrintDocumentData): string {
  const content = `
    <div class="header">
      ${buildCompanyHeader(data.company)}
      ${buildDocBadge(data.number, 'RECEPCIÓN DE MERCANCÍA', data.date, data.status)}
    </div>
    ${buildParties(undefined, data.supplier, data.date)}
    ${data.order_number ? `
      <div style="margin-bottom:16px;padding:8px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;">
        <span style="font-size:8px;font-weight:700;color:#166534;text-transform:uppercase;">OC Referencia:</span>
        <span style="font-size:10px;font-weight:600;color:#166534;margin-left:6px;">${data.order_number}</span>
      </div>
    ` : ''}
    <table>
      <thead>
        <tr>
          <th class="text-center" style="width:30px;">#</th>
          <th>Descripción</th>
          <th class="text-center" style="width:60px;">Cant. Pedida</th>
          <th class="text-center" style="width:60px;">Cant. Recibida</th>
          <th class="text-right" style="width:80px;">P. Unitario</th>
          <th class="text-right" style="width:90px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map((item, i) => `
          <tr>
            <td class="text-center">${i + 1}</td>
            <td>${item.name}${item.sku ? `<br><span style="color:#9ca3af;font-size:8px;">SKU: ${item.sku}</span>` : ''}</td>
            <td class="text-center">${formatNumber(item.quantity)}</td>
            <td class="text-center" style="font-weight:600;">${formatNumber(item.quantity)}</td>
            <td class="text-right">${formatCurrency(item.unit_price)}</td>
            <td class="text-right" style="font-weight:600;">${formatCurrency(item.total)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${buildTotals(data.subtotal, data.tax_amount, data.total, true)}
    ${buildNotes(data.notes)}
    <div class="footer">${buildSignatures()}</div>
  `;
  return wrapDocument(content, `Recepción de Mercancía ${data.number}`);
}
