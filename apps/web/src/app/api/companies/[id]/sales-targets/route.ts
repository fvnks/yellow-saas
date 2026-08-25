import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: targets } = await query(
      `SELECT st.*, e.name as employee_name, e.email as employee_email
       FROM sales_targets st
       LEFT JOIN employees e ON e.id = st.employee_id
       WHERE st.company_id = $1
       ORDER BY st.year DESC, st.month DESC`,
      [companyId]
    );

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const { rows: monthlyActual } = await query(
      `SELECT
        EXTRACT(MONTH FROM created_at) as month,
        EXTRACT(YEAR FROM created_at) as year,
        employee_id,
        SUM(total_amount) as actual_amount,
        COUNT(*) as order_count
       FROM sales_orders
       WHERE company_id = $1 AND status != 'cancelled'
         AND EXTRACT(YEAR FROM created_at) = $2
       GROUP BY EXTRACT(MONTH FROM created_at), EXTRACT(YEAR FROM created_at), employee_id`,
      [companyId, currentYear]
    );

    const enriched = targets.map(t => {
      const actual = monthlyActual.find(a =>
        parseInt(a.month) === t.month && parseInt(a.year) === t.year && a.employee_id === t.employee_id
      );
      return {
        ...t,
        actual_amount: actual ? parseFloat(actual.actual_amount) : 0,
        order_count: actual ? parseInt(actual.order_count) : 0,
        achievement_pct: t.target_amount > 0 ? ((actual ? parseFloat(actual.actual_amount) : 0) / t.target_amount) * 100 : 0,
      };
    });

    return successResponse(enriched);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { employee_id, year, month, target_amount, product_category } = body;

    if (!employee_id || !year || !month || !target_amount) {
      return errorResponse('employee_id, year, month, target_amount son requeridos', 400);
    }

    const { rows } = await query(
      `INSERT INTO sales_targets (company_id, employee_id, year, month, target_amount, product_category)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (company_id, employee_id, year, month, product_category)
       DO UPDATE SET target_amount = $5
       RETURNING *`,
      [companyId, employee_id, year, month, target_amount, product_category || null]
    );

    return successResponse(rows[0], 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
