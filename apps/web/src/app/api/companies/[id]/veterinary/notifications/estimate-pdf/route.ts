import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
}

function esc(str: unknown): string {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  borrador: { label: 'Borrador', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
  pendiente_aprobacion: { label: 'Pendiente Aprobación', color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
  aprobado: { label: 'Aprobado', color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0' },
  rechazado: { label: 'Rechazado', color: '#991b1b', bg: '#fef2f2', border: '#fecaca' },
  expirado: { label: 'Expirado', color: '#6b7280', bg: '#f9fafb', border: '#d1d5db' },
  convertido: { label: 'Convertido', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
};

function generateEstimateHTML(estimate: Record<string, unknown>, items: Record<string, unknown>[]): string {
  const e = estimate;
  const patient = e.patient as Record<string, unknown> | null;
  const client = e.client as Record<string, unknown> | null;
  const statusInfo = STATUS_LABELS[e.status as string] || STATUS_LABELS.borrador;

  const itemRows = items.map((item, idx) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const subtotal = Number(item.subtotal) || qty * price;
    return `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#475569;">${idx + 1}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:500;color:#0f172a;">${esc(item.description)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#475569;">${qty}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#475569;">${formatCLP(price)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#0f172a;">${formatCLP(subtotal)}</td>
      </tr>`;
  }).join('');

  const subtotal = Number(e.subtotal) || 0;
  const ivaPct = Number(e.iva_pct) || 19;
  const ivaAmount = Math.round(subtotal * (ivaPct / 100));
  const total = Number(e.total) || subtotal + ivaAmount;
  const currency = (e.currency as string) || 'CLP';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Presupuesto ${esc(e.estimate_number)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #0f172a; background: #fff; }
    @page { size: A4; margin: 15mm 18mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    .page { width: 100%; max-width: 210mm; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #facc15; padding-bottom: 16px; margin-bottom: 20px; }
    .clinic-info h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .clinic-info p { font-size: 12px; color: #64748b; line-height: 1.5; }
    .doc-meta { text-align: right; }
    .doc-meta h2 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .doc-meta .number { font-size: 13px; color: #475569; }
    .doc-meta .date { font-size: 11px; color: #64748b; margin-top: 4px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid ${statusInfo.border}; background: ${statusInfo.bg}; color: ${statusInfo.color}; margin-top: 6px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; }
    .info-card h3 { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #facc15; margin-bottom: 8px; }
    .info-card p { font-size: 12px; color: #334155; line-height: 1.6; }
    .info-card .label { color: #64748b; font-size: 11px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
    .items-table thead th { background: #0f172a; color: #fff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; padding: 10px; text-align: left; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 20px; }
    .totals-table { width: 280px; }
    .totals-table .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .totals-table .row.total { border-top: 2px solid #0f172a; margin-top: 6px; padding-top: 10px; font-weight: 700; font-size: 16px; color: #0f172a; }
    .notes { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px; }
    .notes h3 { font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 8px; }
    .notes p { font-size: 12px; color: #64748b; line-height: 1.6; white-space: pre-wrap; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 10px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="clinic-info">
        <h1>Clínica Veterinaria</h1>
        <p>RUT: 76.000.000-0</p>
        <p>Av. Ejemplo 1234, Santiago, Chile</p>
        <p>+56 9 1234 5678</p>
      </div>
      <div class="doc-meta">
        <h2>PRESUPUESTO</h2>
        <p class="number">${esc(e.estimate_number)}</p>
        <p class="date">Fecha emisión: ${esc(e.issue_date as string)}</p>
        ${e.valid_until ? `<p class="date">Válido hasta: ${esc(e.valid_until as string)}</p>` : ''}
        <span class="status-badge">${statusInfo.label}</span>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <h3>Propietario</h3>
        <p><span class="label">Nombre:</span> ${esc(client?.full_name)}</p>
        <p><span class="label">RUT:</span> ${esc(client?.rut)}</p>
      </div>
      <div class="info-card">
        <h3>Paciente</h3>
        <p><span class="label">Nombre:</span> ${esc(patient?.name)}</p>
        <p><span class="label">Especie:</span> ${esc(patient?.species)}</p>
        ${patient?.breed ? `<p><span class="label">Raza:</span> ${esc(patient.breed)}</p>` : ''}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th>Descripción</th>
          <th style="width:60px;text-align:center;">Cant.</th>
          <th style="width:110px;text-align:right;">P. Unitario</th>
          <th style="width:110px;text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows || '<tr><td colspan="5" style="padding:16px;text-align:center;color:#94a3b8;">Sin ítems</td></tr>'}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-table">
        <div class="row">
          <span>Subtotal</span>
          <span>${formatCLP(subtotal)}</span>
        </div>
        <div class="row">
          <span>IVA (${ivaPct}%)</span>
          <span>${formatCLP(ivaAmount)}</span>
        </div>
        <div class="row">
          <span>Moneda</span>
          <span>${esc(currency)}</span>
        </div>
        <div class="row total">
          <span>Total</span>
          <span>${formatCLP(total)}</span>
        </div>
      </div>
    </div>

    ${e.note ? `
    <div class="notes">
      <h3>Notas</h3>
      <p>${esc(e.note)}</p>
    </div>` : ''}

    <div class="footer">
      <p>Clínica Veterinaria — Av. Ejemplo 1234, Santiago, Chile — +56 9 1234 5678</p>
      <p>Este presupuesto tiene una validez de 30 días desde la fecha de emisión.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { estimate_id } = body;

    if (!estimate_id) return errorResponse('estimate_id is required', 400);

    const estimateResult = await query(
      `SELECT ve.*,
        (SELECT json_build_object('id', vp.id, 'name', vp.name, 'species', vp.species, 'breed', vp.breed)) as patient,
        (SELECT json_build_object('id', vc.id, 'full_name', vc.full_name, 'rut', vc.rut, 'phone', vc.phone, 'email', vc.email)) as client,
        (SELECT json_build_object('id', vepr.id, 'full_name', vepr.full_name)) as professional
       FROM veterinary_estimates ve
       LEFT JOIN veterinary_patients vp ON vp.id = ve.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = ve.client_id
       LEFT JOIN veterinary_professionals vepr ON vepr.id = ve.professional_id
       WHERE ve.id = $1 AND ve.company_id = $2`,
      [estimate_id, companyId]
    );

    if (estimateResult.rows.length === 0) {
      return errorResponse('Presupuesto no encontrado', 404);
    }

    const estimate = estimateResult.rows[0];

    const itemsResult = await query(
      `SELECT * FROM veterinary_estimate_items WHERE estimate_id = $1 ORDER BY sort_order, id`,
      [estimate_id]
    );

    const html = generateEstimateHTML(estimate, itemsResult.rows);

    return successResponse({
      html,
      title: `Presupuesto ${estimate.estimate_number}`,
    });
  } catch (error) {
    console.error('Error generating estimate PDF:', error);
    return errorResponse('Error al generar el presupuesto', 500);
  }
}
