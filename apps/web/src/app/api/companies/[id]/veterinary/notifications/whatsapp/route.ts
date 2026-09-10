import { NextRequest } from 'next/server';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

interface EstimateItem {
  name: string;
  price: number;
}

interface WhatsAppBody {
  type: 'reminder' | 'estimate';
  id: string;
  patient_name: string;
  client_name: string;
  client_phone: string;
  title: string;
  due_date: string;
  professional_name: string;
  clinic_name: string;
  clinic_phone: string;
  estimate_number?: string;
  total?: number;
  items?: EstimateItem[];
}

function generateReminderMessage(body: WhatsAppBody): string {
  return [
    `Hola ${body.client_name} 👋`,
    '',
    `Le recordamos que ${body.patient_name} tiene programada la actividad:`,
    `📋 ${body.title}`,
    `📅 Fecha: ${body.due_date}`,
    `👨‍⚕️ Profesional: ${body.professional_name}`,
    '',
    `${body.clinic_name}`,
    `📞 ${body.clinic_phone}`,
  ].join('\n');
}

function generateEstimateMessage(body: WhatsAppBody): string {
  const items = (body.items || [])
    .map((item) => `• ${item.name}: $${item.price.toLocaleString('es-CL')}`)
    .join('\n');

  return [
    `Hola ${body.client_name} 👋`,
    '',
    `Su presupuesto ${body.estimate_number} está listo:`,
    '',
    items,
    `💰 Total: $${(body.total || 0).toLocaleString('es-CL')} CLP`,
    '',
    'Para aprobar o consultar:',
    `${body.clinic_name}`,
    `📞 ${body.clinic_phone}`,
  ].join('\n');
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

    const body: WhatsAppBody = await request.json();
    const { type, client_name, client_phone, patient_name, title, due_date, professional_name, clinic_name, clinic_phone } = body;

    if (!type || !client_name || !client_phone || !clinic_name || !clinic_phone) {
      return errorResponse('type, client_name, client_phone, clinic_name, and clinic_phone are required', 400);
    }

    if (type === 'reminder') {
      if (!patient_name || !title || !due_date || !professional_name) {
        return errorResponse('patient_name, title, due_date, and professional_name are required for reminder type', 400);
      }
    }

    if (type === 'estimate') {
      if (!body.estimate_number || body.total === undefined) {
        return errorResponse('estimate_number and total are required for estimate type', 400);
      }
    }

    const message = type === 'reminder'
      ? generateReminderMessage(body)
      : generateEstimateMessage(body);

    const encoded = encodeURIComponent(message);
    const phone = client_phone.replace(/[^0-9+]/g, '');
    const whatsapp_url = `https://wa.me/${phone.replace('+', '')}?text=${encoded}`;

    return successResponse({
      message,
      whatsapp_url,
      phone: client_phone,
    });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
