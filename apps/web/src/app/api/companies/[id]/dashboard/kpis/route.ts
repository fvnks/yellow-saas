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

    const [
      productsResult,
      stockValueResult,
      lowStockResult,
      outOfStockResult,
      customersResult,
      suppliersResult,
      pendingOrdersResult,
      pendingDeliveriesResult,
      pendingInvoicesResult,
      salesMonthResult,
      purchasesMonthResult,
    ] = await Promise.all([
      query(
        `SELECT COUNT(*) as count FROM products WHERE company_id = $1`,
        [companyId]
      ),
      query(
        `SELECT COALESCE(SUM(sl.quantity * p.cost_price), 0) as total_value
         FROM stock_levels sl
         JOIN products p ON p.id = sl.product_id
         WHERE p.company_id = $1`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as count
         FROM products p
         JOIN stock_levels sl ON sl.product_id = p.id
         WHERE p.company_id = $1 AND sl.quantity > 0 AND sl.quantity <= COALESCE(p.min_stock, 10)`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as count
         FROM products p
         WHERE p.company_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM stock_levels sl
           WHERE sl.product_id = p.id AND sl.quantity > 0
         )`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as count FROM customers WHERE company_id = $1`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as count FROM suppliers WHERE company_id = $1`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as count FROM purchase_orders
         WHERE company_id = $1 AND status IN ('pending', 'approved', 'partial')`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as count FROM sales_orders
         WHERE company_id = $1 AND status IN ('confirmed', 'processing', 'partial')`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as count FROM invoices
         WHERE company_id = $1 AND status != 'paid'`,
        [companyId]
      ),
      query(
        `SELECT COALESCE(SUM(total), 0) as total FROM sales_orders
         WHERE company_id = $1 AND created_at >= $2 AND created_at <= $3`,
        [companyId, firstDayMonth, lastDayMonth]
      ),
      query(
        `SELECT COALESCE(SUM(total), 0) as total FROM purchase_orders
         WHERE company_id = $1 AND created_at >= $2 AND created_at <= $3`,
        [companyId, firstDayMonth, lastDayMonth]
      ),
    ]);

    return successResponse({
      total_products: parseInt(productsResult.rows[0]?.count) || 0,
      total_stock_value: parseFloat(stockValueResult.rows[0]?.total_value) || 0,
      low_stock_count: parseInt(lowStockResult.rows[0]?.count) || 0,
      out_of_stock_count: parseInt(outOfStockResult.rows[0]?.count) || 0,
      total_customers: parseInt(customersResult.rows[0]?.count) || 0,
      total_suppliers: parseInt(suppliersResult.rows[0]?.count) || 0,
      pending_orders: parseInt(pendingOrdersResult.rows[0]?.count) || 0,
      pending_deliveries: parseInt(pendingDeliveriesResult.rows[0]?.count) || 0,
      pending_invoices: parseInt(pendingInvoicesResult.rows[0]?.count) || 0,
      total_sales_month: parseFloat(salesMonthResult.rows[0]?.total) || 0,
      total_purchases_month: parseFloat(purchasesMonthResult.rows[0]?.total) || 0,
    });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
