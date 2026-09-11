import { NextRequest } from 'next/server';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

interface EstimateItem {
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface EmailBody {
  type: 'estimate';
  id: string;
  patient_name: string;
  client_name: string;
  email: string;
  title: string;
  professional_name: string;
  clinic_name: string;
  clinic_phone: string;
  clinic_address?: string;
  estimate_number: string;
  estimate_date: string;
  valid_until?: string;
  total: number;
  subtotal: number;
  iva: number;
  items: EstimateItem[];
}

function generateEstimateEmail(body: EmailBody): string {
  const itemsHtml = (body.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#334155;">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#334155;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#334155;">$${item.unit_price.toLocaleString('es-CL')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#334155;font-weight:500;">$${item.subtotal.toLocaleString('es-CL')}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background-color:#0f172a;padding:28px 32px;text-align:center;">
      <h1 style="color:#facc15;margin:0 0 4px;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${body.clinic_name}</h1>
      <p style="color:#94a3b8;margin:0;font-size:13px;">Presupuesto Veterinario</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <!-- Estimate Info -->
      <div style="display:flex;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
        <div>
          <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Presupuesto</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#0f172a;">${body.estimate_number}</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Fecha</p>
          <p style="margin:0;font-size:14px;color:#334155;">${body.estimate_date}</p>
          ${body.valid_until ? `<p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">Válido hasta: ${body.valid_until}</p>` : ''}
        </div>
      </div>

      <!-- Patient & Client -->
      <div style="background-color:#f8fafc;border-radius:8px;padding:16px 20px;margin-bottom:24px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Paciente</p>
        <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">${body.patient_name}</p>
        <p style="margin:8px 0 0 0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Cliente</p>
        <p style="margin:2px 0 0 0;font-size:14px;color:#334155;">${body.client_name}</p>
      </div>

      <!-- Items Table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background-color:#f8fafc;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Descripción</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Cant.</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">P. Unitario</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="display:flex;justify-content:flex-end;margin-bottom:28px;">
        <div style="min-width:240px;">
          <div style="display:flex;justify-content:space-between;padding:6px 0;">
            <span style="color:#64748b;font-size:13px;">Subtotal</span>
            <span style="color:#334155;font-size:13px;">$${body.subtotal.toLocaleString('es-CL')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
            <span style="color:#64748b;font-size:13px;">IVA (19%)</span>
            <span style="color:#334155;font-size:13px;">$${body.iva.toLocaleString('es-CL')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0 0;">
            <span style="color:#0f172a;font-size:15px;font-weight:700;">Total</span>
            <span style="color:#0f172a;font-size:15px;font-weight:700;">$${body.total.toLocaleString('es-CL')} CLP</span>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <p style="color:#64748b;font-size:13px;margin:0 0 12px;">Para aprobar, rechazar o consultar este presupuesto, contáctenos directamente.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#0f172a;">${body.clinic_name}</p>
      <p style="margin:0 0 2px;font-size:12px;color:#64748b;">${body.clinic_phone}</p>
      ${body.clinic_address ? `<p style="margin:0;font-size:12px;color:#94a3b8;">${body.clinic_address}</p>` : ''}
      <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;">Generado por Yellow ERP — Veterinaria</p>
    </div>
  </div>
</body>
</html>`;
}

// STUB: Returns message/url for client-side delivery.
// WhatsApp: returns wa.me deep link (open in browser/app)
// Email: returns HTML body (frontend sends via SendGrid/Resend)
// SMS: returns sms: URL (frontend sends via Twilio)
// TODO: Integrate server-side sending when API keys are configured
export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body: EmailBody = await request.json();
    const { type, client_name, email, patient_name, clinic_name, clinic_phone, estimate_number, estimate_date, total, subtotal, iva, items } = body;

    if (type !== 'estimate') {
      return errorResponse('Only "estimate" type is supported for email', 400);
    }

    if (!client_name || !email || !clinic_name || !clinic_phone || !estimate_number || !estimate_date || total === undefined || subtotal === undefined || iva === undefined) {
      return errorResponse('client_name, email, clinic_name, clinic_phone, estimate_number, estimate_date, total, subtotal, and iva are required', 400);
    }

    if (!items || items.length === 0) {
      return errorResponse('At least one item is required', 400);
    }

    const html_body = generateEstimateEmail(body);
    const subject = `Presupuesto ${estimate_number} - ${clinic_name}`;

    return successResponse({
      subject,
      html_body,
      to: email,
    });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
