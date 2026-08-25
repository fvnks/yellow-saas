import { query } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const productId = url.searchParams.get('product_id');
    const warehouseId = url.searchParams.get('warehouse_id');
    const modelType = url.searchParams.get('model_type');

    let whereClause = 'WHERE df.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (productId) {
      whereClause += ` AND df.product_id = $${paramIndex}`;
      params.push(productId);
      paramIndex++;
    }

    if (warehouseId) {
      whereClause += ` AND df.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    if (modelType) {
      whereClause += ` AND df.model_type = $${paramIndex}`;
      params.push(modelType);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM demand_forecasts df ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT df.*,
        json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) as product,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse
       FROM demand_forecasts df
       JOIN products p ON df.product_id = p.id
       LEFT JOIN warehouses w ON df.warehouse_id = w.id
       ${whereClause}
       ORDER BY df.forecast_date DESC, df.horizon_days
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Demand forecasts error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { product_ids, warehouse_id, horizon_days, model_type, retrain } = body;

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0 || !horizon_days) {
      return errorResponse('product_ids (array) and horizon_days are required', 400);
    }

    const results = [];

    for (const productId of product_ids) {
      const forecast = await generateDemandForecast(companyId, productId, warehouse_id, horizon_days, model_type || 'holt_winters', retrain);
      results.push(...forecast);
    }

    return successResponse({ forecasts: results, count: results.length }, 201);
  } catch (err) {
    console.error('Generate demand forecast error:', err);
    return errorResponse('Internal server error', 500);
  }
}

async function generateDemandForecast(
  companyId: string,
  productId: string,
  warehouseId: string | undefined,
  horizonDays: number,
  modelType: string = 'holt_winters',
  retrain = false
): Promise<any[]> {
  let whereClause = 'WHERE sm.company_id = $1 AND sm.product_id = $2 AND sm.type IN (\'out\', \'transfer_out\')';
  const params: any[] = [companyId, productId];
  let paramIndex = 3;

  if (warehouseId) {
    whereClause += ` AND sm.warehouse_id = $${paramIndex}`;
    params.push(warehouseId);
    paramIndex++;
  }

  whereClause += ` ORDER BY sm.created_at ASC`;

  const movementsResult = await query(
    `SELECT sm.created_at, ABS(sm.quantity) as qty
     FROM stock_movements sm
     ${whereClause}`,
    params
  );

  const dailyDemand = new Map<string, number>();
  for (const m of movementsResult.rows) {
    const dateKey = new Date(m.created_at).toISOString().slice(0, 10);
    dailyDemand.set(dateKey, (dailyDemand.get(dateKey) || 0) + m.qty);
  }

  const demandSeries = Array.from(dailyDemand.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, qty]) => ({ date, qty }));

  if (demandSeries.length < 10) {
    console.warn(`Insufficient data for product ${productId}: ${demandSeries.length} days`);
    return [];
  }

  const { forecast, params: modelParams, accuracy } = await runForecastModel(demandSeries, horizonDays, modelType);

  const forecasts: any[] = [];
  const lastDate = new Date(demandSeries[demandSeries.length - 1].date);

  for (let i = 0; i < horizonDays; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i + 1);

    forecasts.push({
      company_id: companyId,
      product_id: productId,
      warehouse_id: warehouseId || null,
      forecast_date: forecastDate.toISOString().slice(0, 10),
      horizon_days: i + 1,
      forecast_qty: Math.max(0, forecast[i] || 0),
      lower_bound: Math.max(0, (forecast[i] || 0) - accuracy.rmse),
      upper_bound: (forecast[i] || 0) + accuracy.rmse,
      model_type: modelType,
      model_params: modelParams,
      accuracy_mape: accuracy.mape,
      accuracy_rmse: accuracy.rmse,
      trained_at: new Date().toISOString(),
    });
  }

  for (const fc of forecasts) {
    await query(
      `INSERT INTO demand_forecasts (company_id, product_id, warehouse_id, forecast_date, horizon_days, forecast_qty, lower_bound, upper_bound, model_type, model_params, accuracy_mape, accuracy_rmse, trained_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (company_id, product_id, warehouse_id, forecast_date, horizon_days) DO UPDATE SET
         forecast_qty = EXCLUDED.forecast_qty,
         lower_bound = EXCLUDED.lower_bound,
         upper_bound = EXCLUDED.upper_bound,
         model_type = EXCLUDED.model_type,
         model_params = EXCLUDED.model_params,
         accuracy_mape = EXCLUDED.accuracy_mape,
         accuracy_rmse = EXCLUDED.accuracy_rmse,
         trained_at = EXCLUDED.trained_at`,
      [fc.company_id, fc.product_id, fc.warehouse_id, fc.forecast_date, fc.horizon_days, fc.forecast_qty, fc.lower_bound, fc.upper_bound, fc.model_type, JSON.stringify(fc.model_params), fc.accuracy_mape, fc.accuracy_rmse, fc.trained_at]
    );
  }

  return forecasts;
}

async function runForecastModel(demandSeries: { date: string; qty: number }[], horizon: number, modelType: string) {
  const values = demandSeries.map(d => d.qty);
  const n = values.length;

  let forecast: number[] = [];
  let modelParams: any = {};
  let mape = 0;
  let rmse = 0;

  if (modelType === 'moving_average') {
    const windowSize = Math.min(7, Math.floor(n / 3));
    const ma = calculateMovingAverage(values, windowSize);
    const lastMA = ma[ma.length - 1];
    forecast = Array(horizon).fill(lastMA);
    modelParams = { window_size: windowSize };
  } else if (modelType === 'simple_exponential') {
    const alpha = 0.3;
    const ses = simpleExponentialSmoothing(values, alpha);
    const lastSES = ses[ses.length - 1];
    forecast = Array(horizon).fill(lastSES);
    modelParams = { alpha };
  } else if (modelType === 'holt_winters') {
    const seasonalPeriod = 7;
    const { level, trend, seasonal, forecast: hwForecast } = holtWinters(values, seasonalPeriod, horizon);
    forecast = hwForecast;
    modelParams = { seasonal_period: seasonalPeriod, final_level: level, final_trend: trend };
  } else if (modelType === 'arima') {
    const arimaForecast = simpleARIMA(values, horizon);
    forecast = arimaForecast;
    modelParams = { order: [1, 1, 1] };
  }

  const actuals = values.slice(-horizon);
  const predictions = forecast.slice(0, actuals.length);
  if (actuals.length > 0) {
    mape = calculateMAPE(actuals, predictions);
    rmse = calculateRMSE(actuals, predictions);
  }

  return { forecast, params: modelParams, accuracy: { mape, rmse } };
}

function calculateMovingAverage(values: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      result.push(values.slice(0, i + 1).reduce((a, b) => a + b, 0) / (i + 1));
    } else {
      const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
  }
  return result;
}

function simpleExponentialSmoothing(values: number[], alpha: number): number[] {
  const result: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    result.push(alpha * values[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

function holtWinters(values: number[], seasonalPeriod: number, horizon: number) {
  const n = values.length;
  const seasons = Math.floor(n / seasonalPeriod);
  if (seasons < 2) {
    const result = simpleExponentialSmoothing(values, 0.3);
    return { level: result[result.length - 1], trend: 0, seasonal: [], forecast: Array(horizon).fill(result[result.length - 1]) };
  }

  let level = values[0];
  let trend = 0;
  const seasonal: number[] = [];

  for (let i = 0; i < seasonalPeriod; i++) {
    let sum = 0;
    let count = 0;
    for (let j = i; j < n; j += seasonalPeriod) {
      sum += values[j];
      count++;
    }
    seasonal[i] = sum / count / (values.reduce((a, b) => a + b, 0) / n);
  }

  const alpha = 0.3, beta = 0.1, gamma = 0.1;
  const levels: number[] = [level];
  const trends: number[] = [trend];
  const seasonalIndices: number[] = [...seasonal];

  for (let i = 1; i < n; i++) {
    const prevLevel = levels[i - 1];
    const prevTrend = trends[i - 1];
    const prevSeasonal = seasonalIndices[(i - 1) % seasonalPeriod];

    level = alpha * (values[i] / prevSeasonal) + (1 - alpha) * (prevLevel + prevTrend);
    trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;
    seasonalIndices[i % seasonalPeriod] = gamma * (values[i] / level) + (1 - gamma) * prevSeasonal;

    levels.push(level);
    trends.push(trend);
  }

  const forecast: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    const seasonalIdx = (n + h - 1) % seasonalPeriod;
    forecast.push((level + h * trend) * seasonalIndices[seasonalIdx]);
  }

  return {
    level: levels[n - 1],
    trend: trends[n - 1],
    seasonal: seasonalIndices,
    forecast,
  };
}

function simpleARIMA(values: number[], horizon: number): number[] {
  const n = values.length;
  const diff: number[] = [];
  for (let i = 1; i < n; i++) {
    diff.push(values[i] - values[i - 1]);
  }
  const lastDiff = diff[diff.length - 1] || 0;
  const lastValue = values[n - 1];
  return Array(horizon).fill(lastValue + lastDiff);
}

function calculateMAPE(actual: number[], predicted: number[]): number {
  if (actual.length === 0) return 0;
  const sum = actual.reduce((sum, a, i) => sum + Math.abs((a - predicted[i]) / Math.max(a, 1)), 0);
  return (sum / actual.length) * 100;
}

function calculateRMSE(actual: number[], predicted: number[]): number {
  if (actual.length === 0) return 0;
  const sum = actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0);
  return Math.sqrt(sum / actual.length);
}