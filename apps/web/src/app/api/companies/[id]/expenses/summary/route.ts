import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    let where = 'company_id = $1';
    const values: any[] = [companyId];
    let idx = 2;
    if (dateFrom) { where += ` AND expense_date >= $${idx++}`; values.push(dateFrom); }
    if (dateTo) { where += ` AND expense_date <= $${idx++}`; values.push(dateTo); }

    const totalResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as total, COALESCE(SUM(tax_amount), 0) as total_tax,
             COALESCE(SUM(total_amount), 0) as total_with_tax, COUNT(*) as count
      FROM expenses WHERE ${where} AND status = 'approved'
    `, values);

    const categoryResult = await query(`
      SELECT ec.name, ec.color, COALESCE(SUM(e.amount), 0) as total, COUNT(*) as count
      FROM expenses e LEFT JOIN expense_categories ec ON ec.id = e.category_id
      WHERE ${where} AND e.status = 'approved'
      GROUP BY ec.id, ec.name, ec.color ORDER BY total DESC LIMIT 10
    `, values);

    const monthlyResult = await query(`
      SELECT to_char(expense_date, 'YYYY-MM') as month,
             COALESCE(SUM(amount), 0) as total, COUNT(*) as count
      FROM expenses WHERE ${where} AND status = 'approved'
      GROUP BY month ORDER BY month DESC LIMIT 12
    `, values);

    return successResponse({
      total: Number(totalResult.rows[0]?.total || 0),
      total_tax: Number(totalResult.rows[0]?.total_tax || 0),
      total_with_tax: Number(totalResult.rows[0]?.total_with_tax || 0),
      count: Number(totalResult.rows[0]?.count || 0),
      by_category: categoryResult.rows,
      by_month: monthlyResult.rows,
    });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
