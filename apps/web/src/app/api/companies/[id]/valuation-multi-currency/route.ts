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
    const targetCurrency = url.searchParams.get('target_currency');
    const warehouseId = url.searchParams.get('warehouse_id');
    const valuationDate = url.searchParams.get('valuation_date');

    let whereClause = 'WHERE vmc.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (targetCurrency) {
      whereClause += ` AND vmc.target_currency = $${paramIndex}`;
      params.push(targetCurrency);
      paramIndex++;
    }

    if (warehouseId) {
      whereClause += ` AND vmc.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    if (valuationDate) {
      whereClause += ` AND vmc.valuation_date = $${paramIndex}`;
      params.push(valuationDate);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM valuation_multi_currency vmc ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT vmc.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) as product,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        json_build_object('id', er.id, 'rate', er.rate, 'rate_date', er.rate_date, 'from_currency', er.from_currency, 'to_currency', er.to_currency) as exchange_rate
       FROM valuation_multi_currency vmc
       JOIN products p ON vmc.product_id = p.id
       JOIN warehouses w ON vmc.warehouse_id = w.id
       LEFT JOIN exchange_rates er ON vmc.exchange_rate_id = er.id
       ${whereClause}
       ORDER BY vmc.valuation_date DESC, p.name
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Multi-currency valuation error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { target_currency, valuation_date, recalculate } = body;

    if (!target_currency || !valuation_date) {
      return errorResponse('target_currency and valuation_date are required', 400);
    }

    if (target_currency.length !== 3) {
      return errorResponse('Currency code must be 3 characters (ISO 4217)', 400);
    }

    if (target_currency === 'CLP') {
      return errorResponse('Target currency cannot be CLP (base currency)', 400);
    }

    const exchangeRateResult = await query(
      `SELECT id, rate FROM exchange_rates
       WHERE company_id = $1 AND from_currency = 'CLP' AND to_currency = $2 AND rate_date <= $3 AND is_active = true
       ORDER BY rate_date DESC LIMIT 1`,
      [companyId, target_currency.toUpperCase(), valuation_date]
    );

    if (exchangeRateResult.rows.length === 0) {
      return errorResponse(`No exchange rate found for CLP to ${target_currency} on or before ${valuation_date}`, 400);
    }

    const exchangeRate = exchangeRateResult.rows[0];

    if (recalculate) {
      await query(
        `DELETE FROM valuation_multi_currency WHERE company_id = $1 AND target_currency = $2 AND valuation_date = $3`,
        [companyId, target_currency.toUpperCase(), valuation_date]
      );
    }

    const productsResult = await query(
      `SELECT p.id, p.cost_price, sl.quantity, sl.warehouse_id
       FROM products p
       JOIN stock_levels sl ON p.id = sl.product_id AND p.company_id = sl.company_id
       WHERE p.company_id = $1 AND p.track_stock = true AND p.is_active = true AND sl.quantity > 0`,
      [companyId]
    );

    const results = [];
    for (const product of productsResult.rows) {
      const baseValue = product.cost_price * product.quantity;
      const targetValue = baseValue * exchangeRate.rate;

      await query(
        `INSERT INTO valuation_multi_currency (company_id, product_id, warehouse_id, base_currency, target_currency, exchange_rate_id, base_value, target_value, valuation_date)
         VALUES ($1, $2, $3, 'CLP', $4, $5, $6, $7, $8)
         ON CONFLICT (company_id, product_id, warehouse_id, target_currency, valuation_date) DO UPDATE SET
           exchange_rate_id = EXCLUDED.exchange_rate_id,
           base_value = EXCLUDED.base_value,
           target_value = EXCLUDED.target_value
         RETURNING *`,
        [companyId, product.id, product.warehouse_id, target_currency.toUpperCase(), exchangeRate.id, baseValue, targetValue, valuation_date]
      );

      results.push({ product_id: product.id, warehouse_id: product.warehouse_id, base_value: baseValue, target_value: targetValue });
    }

    return successResponse({ 
      exchange_rate: exchangeRate.rate, 
      valuation_date: valuation_date,
      target_currency: target_currency.toUpperCase(),
      products_valued: results.length,
      total_base_value: results.reduce((sum, r) => sum + r.base_value, 0),
      total_target_value: results.reduce((sum, r) => sum + r.target_value, 0),
    }, 201);
  } catch (err) {
    console.error('Multi-currency valuation error:', err);
    return errorResponse('Internal server error', 500);
  }
}