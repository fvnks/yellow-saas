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

    const vehicleCountResult = await query(
      'SELECT COUNT(*) as count FROM auto_vehicles WHERE company_id = $1',
      [company_id]
    );

    const activeOrdersResult = await query(
      `SELECT COUNT(*) as count FROM auto_work_orders 
       WHERE company_id = $1 AND status IN ('checkin', 'diagnostic', 'estimated', 'approved', 'waiting_parts', 'in_progress')`,
      [company_id]
    );

    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const revenueResult = await query(
      `SELECT COALESCE(SUM(total), 0) as total FROM auto_work_orders 
       WHERE company_id = $1 AND status = 'invoiced' AND created_at >= $2`,
      [company_id, startDate.toISOString()]
    );

    const technicianCountResult = await query(
      'SELECT COUNT(*) as count FROM auto_technicians WHERE company_id = $1 AND status = $2',
      [company_id, 'active']
    );

    const baysResult = await query(
      'SELECT COUNT(*) as count FROM auto_bays WHERE company_id = $1 AND status = $2',
      [company_id, 'occupied']
    );

    return successResponse({
      vehicleCount: parseInt(vehicleCountResult.rows[0].count),
      activeOrdersCount: parseInt(activeOrdersResult.rows[0].count),
      totalRevenue: parseInt(revenueResult.rows[0].total),
      technicianCount: parseInt(technicianCountResult.rows[0].count),
      occupiedBays: parseInt(baysResult.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return errorResponse('Failed to fetch stats', 500);
  }
}
