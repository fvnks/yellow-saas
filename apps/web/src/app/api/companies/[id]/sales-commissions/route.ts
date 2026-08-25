import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(req.url);
    const year = url.searchParams.get('year') || new Date().getFullYear().toString();
    const month = url.searchParams.get('month') || (new Date().getMonth() + 1).toString();

    const { rows: commissions } = await query(
      `SELECT so.id as order_id, so.order_number, so.total_amount, so.created_at,
        e.id as employee_id, e.name as employee_name, e.email as employee_email,
        COALESCE(e.commission_rate, 0) as commission_rate,
        so.total_amount * COALESCE(e.commission_rate, 0) / 100 as commission_amount,
        c.name as customer_name
       FROM sales_orders so
       JOIN employees e ON e.id = so.employee_id
       LEFT JOIN customers c ON c.id = so.customer_id
       WHERE so.company_id = $1 AND so.status != 'cancelled'
         AND EXTRACT(YEAR FROM so.created_at) = $2
         AND EXTRACT(MONTH FROM so.created_at) = $3
       ORDER BY so.created_at DESC`,
      [companyId, year, month]
    );

    const byEmployee = commissions.reduce((acc, c) => {
      const key = c.employee_id;
      if (!acc[key]) acc[key] = { name: c.employee_name, email: c.employee_email, rate: parseFloat(c.commission_rate), totalSales: 0, totalCommission: 0, orderCount: 0 };
      acc[key].totalSales += parseFloat(c.total_amount);
      acc[key].totalCommission += parseFloat(c.commission_amount);
      acc[key].orderCount += 1;
      return acc;
    }, {} as Record<string, any>);

    const totalSales = commissions.reduce((sum, c) => sum + parseFloat(c.total_amount), 0);
    const totalCommissions = commissions.reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);

    return successResponse({
      summary: { totalSales, totalCommissions, orderCount: commissions.length },
      byEmployee: Object.values(byEmployee),
      details: commissions,
    });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
