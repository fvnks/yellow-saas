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

    const { rows: bays } = await query(
      'SELECT id, name, number, type, status FROM auto_bays WHERE company_id = $1 ORDER BY number',
      [company_id]
    );

    const { rows: orders } = await query(
      `SELECT bay_id, status FROM auto_work_orders 
       WHERE company_id = $1 AND bay_id IS NOT NULL
         AND status IN ('checkin', 'diagnostic', 'estimated', 'approved', 'waiting_parts', 'in_progress', 'quality_check')`,
      [company_id]
    );

    const chartData = bays.map((bay) => {
      const activeOrders = orders.filter((o) => o.bay_id === bay.id).length;
      return {
        name: `Bay ${bay.number}`,
        type: bay.type,
        status: bay.status,
        activeOrders,
        isOccupied: activeOrders > 0 || bay.status === 'occupied',
      };
    });

    return successResponse(chartData);
  } catch (error) {
    console.error('Error fetching bay occupancy chart:', error);
    return errorResponse('Failed to fetch bay occupancy chart', 500);
  }
}
