import { NextResponse } from 'next/server';
import { query } from '@/app/api/lib/db';
import { successResponse, errorResponse } from '@/app/api/lib/helpers';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const company_id = url.searchParams.get('company_id');

    if (!company_id) {
      return errorResponse('company_id is required', 400);
    }

    const { rows } = await query(
      `SELECT 
         DATE_TRUNC('day', created_at) as date,
         SUM(total) as revenue,
         COUNT(*) as orders
       FROM auto_work_orders
       WHERE company_id = $1 
         AND status = 'invoiced'
         AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE_TRUNC('day', created_at)
       ORDER BY date ASC`,
      [company_id]
    );

    const chartData = rows.map((row) => ({
      date: new Date(row.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
      revenue: parseInt(row.revenue),
      orders: parseInt(row.orders),
    }));

    return successResponse(chartData);
  } catch (error) {
    console.error('Error fetching revenue chart:', error);
    return errorResponse('Failed to fetch revenue chart', 500);
  }
}
