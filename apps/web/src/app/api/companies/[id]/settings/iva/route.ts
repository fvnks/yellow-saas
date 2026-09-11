import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

const DEFAULT_IVA_RATE = 0.19;

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT setting_value FROM company_settings WHERE company_id = $1 AND setting_key = 'iva_rate'`,
      [companyId]
    );

    const ivaRate = rows[0] ? parseFloat(rows[0].setting_value) : DEFAULT_IVA_RATE;
    return successResponse({ iva_rate: ivaRate });
  } catch {
    return successResponse({ iva_rate: DEFAULT_IVA_RATE });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { iva_rate } = body;

    if (typeof iva_rate !== 'number' || iva_rate <= 0 || iva_rate >= 1) {
      return errorResponse('iva_rate debe ser un número entre 0 y 1 (ej: 0.19 para 19%)', 400);
    }

    await query(
      `INSERT INTO company_settings (company_id, setting_key, setting_value)
       VALUES ($1, 'iva_rate', $2)
       ON CONFLICT (company_id, setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()`,
      [companyId, iva_rate.toString()]
    );

    return successResponse({ iva_rate, message: 'Tasa IVA actualizada' });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
