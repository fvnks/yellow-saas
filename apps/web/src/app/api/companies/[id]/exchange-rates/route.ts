import { query, transaction } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

const UF_API_URL = 'https://aw.sbp.cl/cotizacionsisopreview/cotizacionUFJson.cgis';
const UTM_API_URL = 'https://pmem.sii.cl/cpe_sii_pm/cotizacion?fecha=';
const BC_CHILE_USD_URL = 'https://aw.sbp.cl/cotizacionsisopreview/cotizacionDolarJson.cgis';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'uf';
    const date = url.searchParams.get('date') || undefined;

    if (type === 'uf') {
      return await getUF(companyId, date);
    } else if (type === 'utm') {
      return await getUTM(companyId);
    } else if (type === 'usd') {
      return await getUSD(companyId, date);
    }

    return await getAllRates(companyId);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

async function getUF(companyId: string, date?: string) {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const cached = await query(
      `SELECT value, date, source FROM uf_values 
       WHERE company_id = $1 AND date = $2`,
      [companyId, targetDate]
    );

    if (cached.rows.length > 0) {
      return successResponse(cached.rows[0]);
    }

    const fresh = await fetchUFFromBC(targetDate);
    if (fresh) {
      await query(
        `INSERT INTO uf_values (company_id, value, date, source)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (company_id, date) DO UPDATE SET value = EXCLUDED.value`,
        [companyId, fresh.value, fresh.date, fresh.source]
      );
      return successResponse({ ...fresh, company_id: companyId });
    }

    return errorResponse('No se pudo obtener valor de UF', 502);
  } catch (err) {
    console.error('UF fetch error:', err);
    return errorResponse('Error obteniendo UF', 500);
  }
}

async function getUTM(companyId: string) {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const cached = await query(
      `SELECT value, month, year, source FROM utm_values
       WHERE company_id = $1 AND month = $2 AND year = $3`,
      [companyId, month, year]
    );

    if (cached.rows.length > 0) {
      return successResponse(cached.rows[0]);
    }

    const fresh = await fetchUTMFromSII(month, year);
    if (fresh) {
      await query(
        `INSERT INTO utm_values (company_id, value, month, year, source)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (company_id, month, year) DO UPDATE SET value = EXCLUDED.value`,
        [companyId, fresh.value, fresh.month, fresh.year, fresh.source]
      );
      return successResponse({ ...fresh, company_id: companyId });
    }

    return errorResponse('No se pudo obtener valor de UTM', 502);
  } catch (err) {
    console.error('UTM fetch error:', err);
    return errorResponse('Error obteniendo UTM', 500);
  }
}

async function getUSD(companyId: string, date?: string) {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const cached = await query(
      `SELECT value as rate, currency, date, source FROM exchange_rates
       WHERE company_id = $1 AND currency = 'USD' AND date = $2`,
      [companyId, targetDate]
    );

    if (cached.rows.length > 0) {
      return successResponse(cached.rows[0]);
    }

    const fresh = await fetchUSDFromBC(targetDate);
    if (fresh) {
      await query(
        `INSERT INTO exchange_rates (company_id, currency, rate, date, source)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (company_id, currency, date) DO UPDATE SET rate = EXCLUDED.rate`,
        [companyId, 'USD', fresh.rate, fresh.date, fresh.source]
      );
      return successResponse(fresh);
    }

    return errorResponse('No se pudo obtener cotización USD', 502);
  } catch (err) {
    console.error('USD fetch error:', err);
    return errorResponse('Error obteniendo USD', 500);
  }
}

async function getAllRates(companyId: string) {
  try {
    const ufRes = await getUF(companyId);
    const utmRes = await getUTM(companyId);
    const usdRes = await getUSD(companyId);

    const extractData = (res: any) => res.status === 200 ? res.body?.data : null;

    return successResponse({
      uf: extractData(ufRes),
      utm: extractData(utmRes),
      usd: extractData(usdRes),
    });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

async function fetchUFFromBC(date: string) {
  try {
    const response = await fetch(`${UF_API_URL}?fecha=${date}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const value = parseFloat(data.valor);

    if (isNaN(value) || value <= 0) return null;

    return { value, date, source: 'banco_central' };
  } catch {
    return null;
  }
}

async function fetchUTMFromSII(month: number, year: number) {
  try {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const response = await fetch(`${UTM_API_URL}${dateStr}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const value = parseFloat(data.valor);

    if (isNaN(value) || value <= 0) return null;

    return { value, month, year, source: 'sii' };
  } catch {
    return null;
  }
}

async function fetchUSDFromBC(date: string) {
  try {
    const response = await fetch(`${BC_CHILE_USD_URL}?fecha=${date}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const value = parseFloat(data.valor);

    if (isNaN(value) || value <= 0) return null;

    return { rate: 1 / value, date, currency: 'USD', source: 'bc_chile' };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { type } = body;

    if (type === 'uf') {
      return await syncUF(companyId);
    } else if (type === 'utm') {
      return await syncUTM(companyId);
    } else if (type === 'usd') {
      return await syncUSD(companyId);
    }

    return await syncAllRates(companyId);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

async function syncUF(companyId: string) {
  const today = new Date().toISOString().split('T')[0];
  const fresh = await fetchUFFromBC(today);
  if (!fresh) return errorResponse('No se pudo obtener UF', 502);

  await query(
    `INSERT INTO uf_values (company_id, value, date, source)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (company_id, date) DO UPDATE SET value = EXCLUDED.value, source = EXCLUDED.source`,
    [companyId, fresh.value, fresh.date, fresh.source]
  );

  return successResponse(fresh);
}

async function syncUTM(companyId: string) {
  const now = new Date();
  const fresh = await fetchUTMFromSII(now.getMonth() + 1, now.getFullYear());
  if (!fresh) return errorResponse('No se pudo obtener UTM', 502);

  await query(
    `INSERT INTO utm_values (company_id, value, month, year, source)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (company_id, month, year) DO UPDATE SET value = EXCLUDED.value, source = EXCLUDED.source`,
    [companyId, fresh.value, fresh.month, fresh.year, fresh.source]
  );

  return successResponse(fresh);
}

async function syncUSD(companyId: string) {
  const today = new Date().toISOString().split('T')[0];
  const fresh = await fetchUSDFromBC(today);
  if (!fresh) return errorResponse('No se pudo obtener cotización USD', 502);

  await query(
    `INSERT INTO exchange_rates (company_id, currency, rate, date, source)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (company_id, currency, date) DO UPDATE SET rate = EXCLUDED.rate, source = EXCLUDED.source`,
    [companyId, 'USD', fresh.rate, fresh.date, fresh.source]
  );

  return successResponse(fresh);
}

async function syncAllRates(companyId: string) {
  return await transaction(async () => {
    await syncUF(companyId);
    await syncUTM(companyId);
    await syncUSD(companyId);
    
    return successResponse({
      synced_at: new Date().toISOString(),
      message: 'Todos los valores actualizados correctamente',
    });
  });
}
