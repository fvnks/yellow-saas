import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: aging } = await query(
      `SELECT s.id, s.name, s.tax_id, s.email, s.credit_limit,
        pi.id as invoice_id, pi.invoice_number, pi.total_amount, pi.paid_amount,
        pi.total_amount - pi.paid_amount as balance,
        pi.invoice_date, pi.due_date,
        CURRENT_DATE - pi.due_date::date as days_overdue,
        CASE
          WHEN CURRENT_DATE - pi.due_date::date <= 0 THEN 'current'
          WHEN CURRENT_DATE - pi.due_date::date <= 30 THEN '1-30'
          WHEN CURRENT_DATE - pi.due_date::date <= 60 THEN '31-60'
          WHEN CURRENT_DATE - pi.due_date::date <= 90 THEN '61-90'
          ELSE '90+'
        END as aging_bucket
       FROM purchase_invoices pi
       JOIN suppliers s ON s.id = pi.supplier_id
       WHERE pi.company_id = $1 AND pi.status IN ('pending', 'partial', 'overdue') AND pi.total_amount - pi.paid_amount > 0
       ORDER BY s.name, pi.due_date`,
      [companyId]
    );

    const { rows: supplierTotals } = await query(
      `SELECT s.id, s.name, s.tax_id, s.credit_limit,
        COALESCE(SUM(pi.total_amount - pi.paid_amount), 0) as total_balance,
        COALESCE(SUM(CASE WHEN CURRENT_DATE - pi.due_date::date > 0 THEN pi.total_amount - pi.paid_amount ELSE 0 END), 0) as overdue_amount,
        COUNT(CASE WHEN CURRENT_DATE - pi.due_date::date > 0 THEN 1 END) as overdue_count
       FROM suppliers s
       LEFT JOIN purchase_invoices pi ON pi.supplier_id = s.id AND pi.status IN ('pending', 'partial', 'overdue') AND pi.total_amount - pi.paid_amount > 0
       WHERE s.company_id = $1
       GROUP BY s.id, s.name, s.tax_id, s.credit_limit
       HAVING COALESCE(SUM(pi.total_amount - pi.paid_amount), 0) > 0
       ORDER BY total_balance DESC`,
      [companyId]
    );

    const summary = { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0, total: 0 };
    for (const row of aging) {
      summary[row.aging_bucket as keyof typeof summary] += parseFloat(row.balance);
      summary.total += parseFloat(row.balance);
    }

    return successResponse({ aging, supplierTotals, summary });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
