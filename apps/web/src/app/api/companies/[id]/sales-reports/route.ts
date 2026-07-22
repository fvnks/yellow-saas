import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'summary';
    const year = url.searchParams.get('year') || new Date().getFullYear().toString();
    const month = url.searchParams.get('month');

    if (type === 'monthly') {
      const { rows } = await query(
        `SELECT EXTRACT(MONTH FROM created_at) as month,
          SUM(total_amount) as total, COUNT(*) as order_count,
          AVG(total_amount) as avg_order
         FROM sales_orders
         WHERE company_id = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND status != 'cancelled'
         GROUP BY EXTRACT(MONTH FROM created_at)
         ORDER BY month`,
        [companyId, year]
      );
      return successResponse(rows);
    }

    if (type === 'by-customer') {
      const { rows } = await query(
        `SELECT c.name, c.tax_id, SUM(so.total_amount) as total, COUNT(*) as order_count
         FROM sales_orders so JOIN customers c ON c.id = so.customer_id
         WHERE so.company_id = $1 AND EXTRACT(YEAR FROM so.created_at) = $2 AND so.status != 'cancelled'
         GROUP BY c.id, c.name, c.tax_id
         ORDER BY total DESC`,
        [companyId, year]
      );
      return successResponse(rows);
    }

    if (type === 'by-product') {
      const { rows } = await query(
        `SELECT p.name, p.sku, SUM(soi.quantity) as qty, SUM(soi.line_total) as total
         FROM sales_order_items soi
         JOIN sales_orders so ON so.id = soi.order_id
         JOIN products p ON p.id = soi.product_id
         WHERE so.company_id = $1 AND EXTRACT(YEAR FROM so.created_at) = $2 AND so.status != 'cancelled'
         GROUP BY p.id, p.name, p.sku
         ORDER BY total DESC`,
        [companyId, year]
      );
      return successResponse(rows);
    }

    if (type === 'by-employee') {
      const { rows } = await query(
        `SELECT e.name, SUM(so.total_amount) as total, COUNT(*) as order_count,
          AVG(so.total_amount) as avg_order
         FROM sales_orders so JOIN employees e ON e.id = so.employee_id
         WHERE so.company_id = $1 AND EXTRACT(YEAR FROM so.created_at) = $2 AND so.status != 'cancelled'
         GROUP BY e.id, e.name
         ORDER BY total DESC`,
        [companyId, year]
      );
      return successResponse(rows);
    }

    const { rows: totalSales } = await query(
      `SELECT SUM(total_amount) as total, COUNT(*) as count, AVG(total_amount) as avg_order
       FROM sales_orders WHERE company_id = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND status != 'cancelled'`,
      [companyId, year]
    );

    const { rows: totalInvoiced } = await query(
      `SELECT SUM(total_amount) as total, SUM(paid_amount) as paid
       FROM invoices WHERE company_id = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND status != 'cancelled'`,
      [companyId, year]
    );

    const { rows: topProducts } = await query(
      `SELECT p.name, SUM(soi.quantity) as qty, SUM(soi.line_total) as total
       FROM sales_order_items soi
       JOIN sales_orders so ON so.id = soi.order_id
       JOIN products p ON p.id = soi.product_id
       WHERE so.company_id = $1 AND EXTRACT(YEAR FROM so.created_at) = $2 AND so.status != 'cancelled'
       GROUP BY p.id, p.name ORDER BY total DESC LIMIT 5`,
      [companyId, year]
    );

    const { rows: topCustomers } = await query(
      `SELECT c.name, SUM(so.total_amount) as total, COUNT(*) as count
       FROM sales_orders so JOIN customers c ON c.id = so.customer_id
       WHERE so.company_id = $1 AND EXTRACT(YEAR FROM so.created_at) = $2 AND so.status != 'cancelled'
       GROUP BY c.id, c.name ORDER BY total DESC LIMIT 5`,
      [companyId, year]
    );

    const { rows: statusBreakdown } = await query(
      `SELECT status, COUNT(*) as count, SUM(total_amount) as total
       FROM sales_orders WHERE company_id = $1 AND EXTRACT(YEAR FROM created_at) = $2
       GROUP BY status`,
      [companyId, year]
    );

    return successResponse({
      summary: totalSales[0],
      invoicing: totalInvoiced[0],
      topProducts,
      topCustomers,
      statusBreakdown,
    });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
