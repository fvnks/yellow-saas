import { query } from '@/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const fromCurrency = url.searchParams.get('from_currency');
    const toCurrency = url.searchParams.get('to_currency');
    const isActive = url.searchParams.get('is_active');

    let whereClause = 'WHERE er.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (fromCurrency) {
      whereClause += ` AND er.from_currency = $${paramIndex}`;
      params.push(fromCurrency);
      paramIndex++;
    }

    if (toCurrency) {
      whereClause += ` AND er.to_currency = $${paramIndex}`;
      params.push(toCurrency);
      paramIndex++;
    }

    if (isActive !== null) {
      whereClause += ` AND er.is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM exchange_rates er ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT er.* FROM exchange_rates er ${whereClause} ORDER BY er.rate_date DESC, er.from_currency, er.to_currency LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Exchange rates error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { from_currency, to_currency, rate, rate_date, source } = body;

    if (!from_currency || !to_currency || !rate || !rate_date) {
      return errorResponse('from_currency, to_currency, rate, and rate_date are required', 400);
    }

    if (from_currency.length !== 3 || to_currency.length !== 3) {
      return errorResponse('Currency codes must be 3 characters (ISO 4217)', 400);
    }

    if (from_currency === to_currency) {
      return errorResponse('from_currency and to_currency cannot be the same', 400);
    }

    const validSources = ['manual', 'mindicador', 'banco_central', 'fixer', 'exchangerate_api'];
    if (source && !validSources.includes(source)) {
      return errorResponse(`source must be one of: ${validSources.join(', ')}`, 400);
    }

    const result = await query(
      `INSERT INTO exchange_rates (company_id, from_currency, to_currency, rate, rate_date, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (company_id, from_currency, to_currency, rate_date) DO UPDATE SET
         rate = EXCLUDED.rate,
         source = EXCLUDED.source,
         is_active = true,
         created_at = NOW()
       RETURNING *`,
      [companyId, from_currency.toUpperCase(), to_currency.toUpperCase(), rate, rate_date, source || 'manual']
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Create exchange rate error:', err);
    if (err instanceof Error && err.message.includes('duplicate key')) {
      return errorResponse('Exchange rate already exists for this date', 400);
    }
    return errorResponse('Internal server error', 500);
  }
}