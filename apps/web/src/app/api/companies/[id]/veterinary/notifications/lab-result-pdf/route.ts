import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

function esc(str: unknown): string {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function flagColor(flag: string | null): string {
  if (flag === 'critico') return '#dc2626';
  if (flag === 'alto') return '#f97316';
  if (flag === 'bajo') return '#3b82f6';
  return '#16a34a';
}

function generateLabResultHTML(order: Record<string, unknown>, results: Record<string, unknown>[]): string {
  const patientName = esc(order.patient_name as string);
  const clientName = esc(order.client_name as string);
  const professionalName = esc(order.professional_name as string);
  const panelName = esc(order.panel_name as string || order.test_name as string || 'Laboratorio');

  const resultRows = results.map((r, idx) => {
    const flag = (r.flag as string) || 'normal';
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#475569;">${idx + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:500;color:#0f172a;">${esc(r.test_name)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#0f172a;text-align:center;">${esc(r.value) || '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">${esc(r.unit) || '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;">${esc(r.reference_range) || '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">
          <span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;color:#fff;background:${flagColor(flag)};text-transform:uppercase;">${esc(flag)}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;">${esc(r.note) || '—'}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Resultados de Laboratorio - ${patientName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #0f172a; background: #fff; }
    @page { size: A4 landscape; margin: 12mm 15mm; }
  </style>
</head>
<body>
  <div style="max-width:900px;margin:0 auto;padding:20px;">
    <div style="text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #facc15;">
      <h1 style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Resultados de Laboratorio</h1>
      <p style="color:#64748b;font-size:13px;margin-top:4px;">${panelName}</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;padding:14px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
      <div>
        <p style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Paciente</p>
        <p style="font-size:14px;font-weight:700;color:#0f172a;">${patientName}</p>
      </div>
      <div>
        <p style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Propietario</p>
        <p style="font-size:14px;font-weight:700;color:#0f172a;">${clientName}</p>
      </div>
      <div>
        <p style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Especie / Raza</p>
        <p style="font-size:14px;font-weight:700;color:#0f172a;">${esc(order.patient_species as string) || '—'} / ${esc(order.patient_breed as string) || '—'}</p>
      </div>
      <div>
        <p style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Profesional</p>
        <p style="font-size:14px;font-weight:700;color:#0f172a;">Dr(a). ${professionalName}</p>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <thead>
        <tr style="background:#0f172a;color:#fff;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;border-radius:8px 0 0 0;">#</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;">Examen</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;">Resultado</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;">Unidad</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;">Referencia</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;border-radius:0 8px 0 0;">Estado</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;">Nota</th>
        </tr>
      </thead>
      <tbody>
        ${resultRows}
      </tbody>
    </table>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:50px;">
      <div style="text-align:center;">
        <div style="border-bottom:1px solid #94a3b8;margin-bottom:6px;"></div>
        <p style="font-size:11px;color:#64748b;font-weight:600;">Firma Profesional</p>
        <p style="font-size:12px;font-weight:700;color:#0f172a;">Dr(a). ${professionalName}</p>
      </div>
      <div style="text-align:center;">
        <div style="border-bottom:1px solid #94a3b8;margin-bottom:6px;"></div>
        <p style="font-size:11px;color:#64748b;font-weight:600;">Firma Propietario</p>
        <p style="font-size:12px;font-weight:700;color:#0f172a;">${clientName}</p>
      </div>
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
    const { order_id } = body;

    if (!order_id) return errorResponse('order_id is required', 400);

    const orderResult = await query(
      `SELECT vlo.*,
        vpp.name AS patient_name, vpp.species AS patient_species, vpp.breed AS patient_breed,
        vpct.full_name AS client_name,
        vpf.full_name AS professional_name
       FROM veterinary_lab_orders vlo
       JOIN veterinary_patients vpp ON vpp.id = vlo.patient_id
       JOIN veterinary_clients vpct ON vpct.id = vlo.client_id
       JOIN veterinary_professionals vpf ON vpf.id = vlo.professional_id
       WHERE vlo.id = $1 AND vlo.company_id = $2`,
      [order_id, companyId]
    );

    if (orderResult.rows.length === 0) {
      return errorResponse('Orden de laboratorio no encontrada', 404);
    }

    const order = orderResult.rows[0];

    const resultsResult = await query(
      `SELECT * FROM veterinary_lab_results WHERE order_id = $1 AND company_id = $2 ORDER BY id`,
      [order_id, companyId]
    );

    const html = generateLabResultHTML(order, resultsResult.rows);

    return successResponse({
      html,
      title: `Resultados Lab - ${order.patient_name || 'Paciente'}`,
    });
  } catch (error) {
    console.error('Error generating lab result PDF:', error);
    return errorResponse('Error al generar resultados de laboratorio', 500);
  }
}
