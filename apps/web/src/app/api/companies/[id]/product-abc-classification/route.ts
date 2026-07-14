import { query } from '../../../../../lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '../../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const warehouseId = url.searchParams.get('warehouse_id');
    const abcClass = url.searchParams.get('abc_class');
    const xyzClass = url.searchParams.get('xyz_class');

    let whereClause = 'WHERE pac.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (warehouseId) {
      whereClause += ` AND pac.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    if (abcClass) {
      whereClause += ` AND pac.abc_class = $${paramIndex}`;
      params.push(abcClass);
      paramIndex++;
    }

    if (xyzClass) {
      whereClause += ` AND pac.xyz_class = $${paramIndex}`;
      params.push(xyzClass);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM product_abc_classification pac ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT pac.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) as product,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse
       FROM product_abc_classification pac
       JOIN products p ON pac.product_id = p.id
       LEFT JOIN warehouses w ON pac.warehouse_id = w.id
       ${whereClause}
       ORDER BY pac.abc_class, pac.xyz_class, pac.cummulative_pct
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Product ABC classification error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { period_start, period_end, warehouse_id, recalculate } = body;

    if (!period_start || !period_end) {
      return errorResponse('period_start and period_end are required', 400);
    }

    if (recalculate) {
      await query('DELETE FROM product_abc_classification WHERE company_id = $1 AND period_start = $2 AND period_end = $3', [companyId, period_start, period_end]);
    }

    const abcResults = await calculateABCClassification(companyId, period_start, period_end, warehouse_id);
    return successResponse({ classifications: abcResults, count: abcResults.length }, 201);
  } catch (err) {
    console.error('Calculate ABC classification error:', err);
    return errorResponse('Internal server error', 500);
  }
}

async function calculateABCClassification(companyId: string, periodStart: string, periodEnd: string, warehouseId?: string) {
  let whereClause = 'WHERE p.company_id = $1 AND p.track_stock = true AND p.is_active = true';
  const params: any[] = [companyId];
  let paramIndex = 2;

  if (warehouseId) {
    whereClause += ` AND sl.warehouse_id = $${paramIndex}`;
    params.push(warehouseId);
    paramIndex++;
  }

  whereClause += ` AND sm.created_at >= $${paramIndex} AND sm.created_at <= $${paramIndex + 1}`;
  params.push(periodStart, periodEnd);
  paramIndex += 2;

  const movementsResult = await query(
    `SELECT p.id as product_id, p.name, p.sku, sl.warehouse_id,
      SUM(CASE WHEN sm.type IN ('out', 'transfer_out') THEN ABS(sm.quantity) ELSE 0 END) as total_qty,
      SUM(CASE WHEN sm.type IN ('out', 'transfer_out') THEN ABS(sm.quantity) * COALESCE(sm.unit_cost, p.cost_price) ELSE 0 END) as total_value
     FROM products p
     JOIN stock_movements sm ON p.id = sm.product_id AND p.company_id = sm.company_id
     JOIN stock_levels sl ON sl.product_id = p.id AND sl.company_id = p.company_id
     ${whereClause}
     GROUP BY p.id, p.name, p.sku, sl.warehouse_id`,
    params
  );

  const products = movementsResult.rows;
  if (products.length === 0) return [];

  const sortedByValue = [...products].sort((a, b) => b.total_value - a.total_value);
  const totalValue = sortedByValue.reduce((sum, p) => sum + (a.total_value || 0), 0);

  let cummulative = 0;
  const classifications: any[] = [];

  for (let i = 0; i < sortedByValue.length; i++) {
    const p = sortedByValue[i];
    cummulative += p.total_value || 0;
    const cummulativePct = totalValue > 0 ? (cummulative / totalValue) * 100 : 0;

    let abcClass: 'A' | 'B' | 'C';
    if (cummulativePct <= 80) abcClass = 'A';
    else if (cummulativePct <= 95) abcClass = 'B';
    else abcClass = 'C';

    classifications.push({
      product_id: p.product_id,
      warehouse_id: p.warehouse_id,
      abc_class: abcClass,
      annual_consumption_value: p.total_value,
      annual_consumption_qty: p.total_qty,
      rank_position: i + 1,
      total_products: sortedByValue.length,
      cummulative_pct: Math.round(cummulativePct * 100) / 100,
    });
  }

  for (const cls of classifications) {
    const productMovements = await query(
      `SELECT sm.quantity, sm.created_at
       FROM stock_movements sm
       WHERE sm.company_id = $1 AND sm.product_id = $2 ${warehouseId ? 'AND sm.warehouse_id = $3' : ''}
         AND sm.created_at >= $${warehouseId ? 4 : 3} AND sm.created_at <= $${warehouseId ? 5 : 4}
         AND sm.type IN ('out', 'transfer_out')
       ORDER BY sm.created_at`,
      warehouseId ? [companyId, cls.product_id, cls.warehouse_id, periodStart, periodEnd] : [companyId, cls.product_id, periodStart, periodEnd]
    );

    const qtyByMonth = new Map<string, number>();
    for (const m of productMovements.rows) {
      const monthKey = new Date(m.created_at).toISOString().slice(0, 7);
      qtyByMonth.set(monthKey, (qtyByMonth.get(monthKey) || 0) + Math.abs(m.quantity));
    }

    const monthlyValues = Array.from(qtyByMonth.values());
    let xyzClass: 'X' | 'Y' | 'Z' = 'X';
    let variance = 0;
    let cov = 0;

    if (monthlyValues.length >= 3) {
      const mean = monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length;
      variance = monthlyValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / monthlyValues.length;
      const stdDev = Math.sqrt(variance);
      cov = mean > 0 ? stdDev / mean : 0;

      if (cov <= 0.25) xyzClass = 'X';
      else if (cov <= 0.5) xyzClass = 'Y';
      else xyzClass = 'Z';
    }

    const classification = classifications.find(c => c.product_id === cls.product_id && c.warehouse_id === cls.warehouse_id);
    if (classification) {
      classification.xyz_class = xyzClass;
      classification.combined_class = `${cls.abc_class}${xyzClass}`;
      classification.demand_variance = variance;
      classification.coefficient_of_variation = cov;
    }
  }

  for (const cls of classifications) {
    await query(
      `INSERT INTO product_abc_classification (company_id, product_id, warehouse_id, period_start, period_end, abc_class, xyz_class, combined_class, annual_consumption_value, annual_consumption_qty, demand_variance, coefficient_of_variation, rank_position, total_products, cummulative_pct)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (company_id, product_id, warehouse_id, period_start, period_end) DO UPDATE SET
         abc_class = EXCLUDED.abc_class,
         xyz_class = EXCLUDED.xyz_class,
         combined_class = EXCLUDED.combined_class,
         annual_consumption_value = EXCLUDED.annual_consumption_value,
         annual_consumption_qty = EXCLUDED.annual_consumption_qty,
         demand_variance = EXCLUDED.demand_variance,
         coefficient_of_variation = EXCLUDED.coefficient_of_variation,
         rank_position = EXCLUDED.rank_position,
         total_products = EXCLUDED.total_products,
         cummulative_pct = EXCLUDED.cummulative_pct,
         calculated_at = NOW()`,
      [companyId, cls.product_id, cls.warehouse_id, periodStart, periodEnd, cls.abc_class, cls.xyz_class, cls.combined_class, cls.annual_consumption_value, cls.annual_consumption_qty, cls.demand_variance, cls.coefficient_of_variation, cls.rank_position, cls.total_products, cls.cummulative_pct]
    );
  }

  return classifications;
}