import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

const DEFAULT_UF_VALUE = 38500;

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT setting_key, setting_value, updated_at FROM company_settings
       WHERE company_id = $1 AND setting_key = 'uf_value'`,
      [companyId]
    );

    const ufValue = rows[0] ? parseFloat(rows[0].setting_value) : DEFAULT_UF_VALUE;

    return successResponse({ uf_value: ufValue, updated_at: rows[0]?.updated_at || null });
  } catch {
    return successResponse({ uf_value: DEFAULT_UF_VALUE, updated_at: null });
  }
}

export async function PUT(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  const body = await request.json();
  const { uf_value } = body;

  if (!uf_value || uf_value <= 0) {
    return errorResponse('uf_value must be a positive number', 400);
  }

  try {
    await query(
      `INSERT INTO company_settings (company_id, setting_key, setting_value)
       VALUES ($1, 'uf_value', $2)
       ON CONFLICT (company_id, setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()`,
      [companyId, uf_value.toString()]
    );

    return successResponse({ uf_value, message: 'Valor UF actualizado' });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
