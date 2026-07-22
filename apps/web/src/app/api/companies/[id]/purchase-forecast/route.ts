import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: monthlyData } = await query(
      `SELECT EXTRACT(YEAR FROM created_at) as year, EXTRACT(MONTH FROM created_at) as month,
        SUM(total_amount) as total, COUNT(*) as order_count
       FROM purchase_orders WHERE company_id = $1 AND status != 'cancelled' AND created_at >= NOW() - INTERVAL '24 months'
       GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at) ORDER BY year, month`, [companyId]);

    const monthly = monthlyData.map(m => ({ year: parseInt(m.year), month: parseInt(m.month), total: parseFloat(m.total), order_count: parseInt(m.order_count) }));
    const last6 = monthly.slice(-6);
    const avgMonthly = last6.length > 0 ? last6.reduce((s, m) => s + m.total, 0) / last6.length : 0;
    const avgOrders = last6.length > 0 ? last6.reduce((s, m) => s + m.order_count, 0) / last6.length : 0;

    const seasonal = Array(12).fill(0);
    const sCounts = Array(12).fill(0);
    for (const m of monthly) { seasonal[m.month - 1] += m.total; sCounts[m.month - 1] += 1; }
    const seasonality = seasonal.map((f, i) => sCounts[i] > 0 ? f / sCounts[i] : 0);
    const overallAvg = seasonality.reduce((s, v) => s + v, 0) / 12 || 1;
    const seasonalIdx = seasonality.map(v => overallAvg > 0 ? v / overallAvg : 1);

    const now = new Date();
    const forecast = [];
    for (let i = 1; i <= 3; i++) {
      const fm = now.getMonth() + i;
      const fy = fm > 12 ? now.getFullYear() + 1 : now.getFullYear();
      const am = fm > 12 ? fm - 12 : fm;
      const predicted = avgMonthly * seasonalIdx[am - 1];
      forecast.push({ year: fy, month: am, predicted_total: Math.round(predicted), predicted_orders: Math.round(avgOrders * seasonalIdx[am - 1]), confidence_low: Math.round(predicted * 0.8), confidence_high: Math.round(predicted * 1.2) });
    }

    return successResponse({ monthly, forecast, seasonality: seasonalIdx, avgMonthly, avgOrders });
  } catch (e: any) { return errorResponse(e.message, 500); }
}
