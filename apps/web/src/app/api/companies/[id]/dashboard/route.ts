import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const now = new Date();
    const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDayMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    const [
      salesResult,
      prevSalesResult,
      purchasesResult,
      prevPurchasesResult,
      customersResult,
      prevCustomersResult,
      productsResult,
      invoicesResult,
      mermasResult,
      topProductsResult,
      salesByDayResult,
      purchasesByDayResult,
      salesByStatusResult,
      purchasesByStatusResult,
      customersByMonthResult,
      recentSalesResult,
      recentPurchasesResult,
    ] = await Promise.all([
      query(
        `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total 
         FROM sales_orders WHERE company_id = $1 AND created_at >= $2 AND created_at <= $3`,
        [companyId, firstDayMonth, lastDayMonth]
      ),
      query(
        `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total 
         FROM sales_orders WHERE company_id = $1 AND created_at >= $2 AND created_at <= $3`,
        [companyId, firstDayPrevMonth, lastDayPrevMonth]
      ),
      query(
        `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total 
         FROM purchase_orders WHERE company_id = $1 AND created_at >= $2 AND created_at <= $3`,
        [companyId, firstDayMonth, lastDayMonth]
      ),
      query(
        `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total 
         FROM purchase_orders WHERE company_id = $1 AND created_at >= $2 AND created_at <= $3`,
        [companyId, firstDayPrevMonth, lastDayPrevMonth]
      ),
      query(
        `SELECT COUNT(*) as count FROM customers WHERE company_id = $1 AND created_at >= $2 AND created_at <= $3`,
        [companyId, firstDayMonth, lastDayMonth]
      ),
      query(
        `SELECT COUNT(*) as count FROM customers WHERE company_id = $1 AND created_at >= $2 AND created_at <= $3`,
        [companyId, firstDayPrevMonth, lastDayPrevMonth]
      ),
      query(
        `SELECT COUNT(*) as total,
          SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active,
          (SELECT COUNT(*) FROM stock_levels sl 
           JOIN products p ON p.id = sl.product_id 
           WHERE p.company_id = $1 AND sl.quantity <= COALESCE(p.min_stock, 10)) as low_stock`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as total,
          SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid,
          SUM(CASE WHEN payment_status != 'paid' OR payment_status IS NULL THEN 1 ELSE 0 END) as pending,
          COALESCE(SUM(total_amount), 0) as total_amount,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_amount
         FROM invoices WHERE company_id = $1`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as count, COALESCE(SUM(smi.quantity * COALESCE(p.cost_price, 0)), 0) as total_cost
         FROM stock_movements sm
         JOIN stock_movement_items smi ON smi.movement_id = sm.id
         JOIN products p ON p.id = smi.product_id
         WHERE sm.company_id = $1 AND sm.type IN ('loss', 'adjustment', 'merma')`,
        [companyId]
      ),
      query(
        `SELECT p.name, p.sku, COALESCE(SUM(smi.quantity), 0) as total_sold
         FROM sales_order_items soi
         JOIN sales_orders so ON so.id = soi.order_id
         JOIN products p ON p.id = soi.product_id
         WHERE so.company_id = $1 AND so.created_at >= $2
         GROUP BY p.id, p.name, p.sku
         ORDER BY total_sold DESC
         LIMIT 5`,
        [companyId, firstDayMonth]
      ),
      query(
        `SELECT TO_CHAR(created_at::date, 'DD') as day, 
          COUNT(*) as count, COALESCE(SUM(total), 0) as total
         FROM sales_orders 
         WHERE company_id = $1 AND created_at >= $2 AND created_at <= $3
         GROUP BY created_at::date
         ORDER BY created_at::date`,
        [companyId, firstDayMonth, lastDayMonth]
      ),
      query(
        `SELECT TO_CHAR(created_at::date, 'DD') as day,
          COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
         FROM purchase_orders
         WHERE company_id = $1 AND created_at >= $2 AND created_at <= $3
         GROUP BY created_at::date
         ORDER BY created_at::date`,
        [companyId, firstDayMonth, lastDayMonth]
      ),
      query(
        `SELECT status, COUNT(*) as count
         FROM sales_orders WHERE company_id = $1
         GROUP BY status`,
        [companyId]
      ),
      query(
        `SELECT status, COUNT(*) as count
         FROM purchase_orders WHERE company_id = $1
         GROUP BY status`,
        [companyId]
      ),
      query(
        `SELECT TO_CHAR(created_at::date, 'YYYY-MM') as month, COUNT(*) as count
         FROM customers WHERE company_id = $1
         GROUP BY month ORDER BY month DESC LIMIT 6`,
        [companyId]
      ),
      query(
        `SELECT so.*, 
          (SELECT json_build_object('name', c.name) FROM customers c WHERE c.id = so.customer_id) as customer
         FROM sales_orders so
         WHERE so.company_id = $1
         ORDER BY so.created_at DESC LIMIT 5`,
        [companyId]
      ),
      query(
        `SELECT po.*,
          (SELECT json_build_object('name', s.name) FROM suppliers s WHERE s.id = po.supplier_id) as supplier
         FROM purchase_orders po
         WHERE po.company_id = $1
         ORDER BY po.created_at DESC LIMIT 5`,
        [companyId]
      ),
    ]);

    const sales = salesResult.rows[0];
    const prevSales = prevSalesResult.rows[0];
    const purchases = purchasesResult.rows[0];
    const prevPurchases = prevPurchasesResult.rows[0];
    const customers = customersResult.rows[0];
    const prevCustomers = prevCustomersResult.rows[0];
    const products = productsResult.rows[0];
    const invoices = invoicesResult.rows[0];
    const mermas = mermasResult.rows[0];

    const salesChange = prevSales.total > 0 
      ? Math.round(((sales.total - prevSales.total) / prevSales.total) * 100) 
      : 0;
    const purchasesChange = prevPurchases.total > 0 
      ? Math.round(((purchases.total - prevPurchases.total) / prevPurchases.total) * 100) 
      : 0;

    return successResponse({
      kpis: {
        sales: {
          count: parseInt(sales.count) || 0,
          total: parseFloat(sales.total) || 0,
          change: salesChange,
        },
        purchases: {
          count: parseInt(purchases.count) || 0,
          total: parseFloat(purchases.total) || 0,
          change: purchasesChange,
        },
        customers: {
          total: parseInt(customers.count) || 0,
          change: parseInt(customers.count) || 0,
        },
        products: {
          total: parseInt(products.total) || 0,
          active: parseInt(products.active) || 0,
          lowStock: parseInt(products.low_stock) || 0,
        },
        invoices: {
          total: parseInt(invoices.total) || 0,
          paid: parseInt(invoices.paid) || 0,
          pending: parseInt(invoices.pending) || 0,
          totalAmount: parseFloat(invoices.total_amount) || 0,
          paidAmount: parseFloat(invoices.paid_amount) || 0,
        },
        mermas: {
          count: parseInt(mermas.count) || 0,
          totalCost: parseFloat(mermas.total_cost) || 0,
        },
      },
      charts: {
        salesByDay: salesByDayResult.rows,
        purchasesByDay: purchasesByDayResult.rows,
        salesByStatus: salesByStatusResult.rows,
        purchasesByStatus: purchasesByStatusResult.rows,
        customersByMonth: customersByMonthResult.rows,
        topProducts: topProductsResult.rows,
      },
      recent: {
        sales: recentSalesResult.rows,
        purchases: recentPurchasesResult.rows,
      },
    });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
