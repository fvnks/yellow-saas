import { NextRequest } from 'next/server';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

interface SmsBody {
  type: 'reminder';
  id: string;
  patient_name: string;
  client_name: string;
  client_phone: string;
  title: string;
  due_date: string;
  professional_name: string;
  clinic_name: string;
  clinic_phone: string;
}

function generateReminderSms(body: SmsBody): string {
  const msg = `${body.clinic_name}: Recordatorio ${body.patient_name} - ${body.title} el ${body.due_date}. ${body.professional_name}. Info: ${body.clinic_phone}`;
  return msg.length <= 160 ? msg : msg.substring(0, 157) + '...';
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body: SmsBody = await request.json();
    const { type, client_name, client_phone, patient_name, title, due_date, professional_name, clinic_name, clinic_phone } = body;

    if (type !== 'reminder') {
      return errorResponse('Only "reminder" type is supported for SMS', 400);
    }

    if (!client_name || !client_phone || !patient_name || !title || !due_date || !professional_name || !clinic_name || !clinic_phone) {
      return errorResponse('All fields are required for SMS reminder', 400);
    }

    const message = generateReminderSms(body);
    const encoded = encodeURIComponent(message);
    const phone = client_phone.replace(/[^0-9+]/g, '');
    const sms_url = `sms:${phone}?body=${encoded}`;

    return successResponse({
      message,
      sms_url,
      phone: client_phone,
      char_count: message.length,
    });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
