import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(request.url);
    const report = searchParams.get('report') || 'all';
    const dateFrom = searchParams.get('date_from') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const dateTo = searchParams.get('date_to') || new Date().toISOString().split('T')[0];
    const warehouseId = searchParams.get('warehouse');

    const result: any = {};

    if (report === 'all' || report === 'sales') {
      try {
        const salesQuery = await query(`
          SELECT
            COALESCE(SUM(total), 0) as "totalSold",
            COUNT(*) as "orderCount",
            CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(total), 0) / COUNT(*) ELSE 0 END as "avgTicket"
          FROM sales_orders
          WHERE company_id = $1
            AND created_at >= $2::date
            AND created_at < ($3::date + INTERVAL '1 day')
            AND status != 'cancelled'
        `, [companyId, dateFrom, dateTo]);

        const topProductsQuery = await query(`
          SELECT
            p.id, p.name, p.sku,
            COALESCE(SUM(soi.quantity), 0) as units,
            COALESCE(SUM(soi.line_total), 0) as total
          FROM sales_order_items soi
          JOIN sales_orders so ON so.id = soi.order_id
          JOIN products p ON p.id = soi.product_id
          WHERE so.company_id = $1
            AND so.created_at >= $2::date
            AND so.created_at < ($3::date + INTERVAL '1 day')
            AND so.status != 'cancelled'
          GROUP BY p.id, p.name, p.sku
          ORDER BY total DESC
          LIMIT 10
        `, [companyId, dateFrom, dateTo]);

        const topProducts = topProductsQuery.rows;
        const totalSales = parseFloat(salesQuery.rows[0]?.totalSold || '0');

        result.sales = {
          totalSold: totalSales,
          orderCount: parseInt(salesQuery.rows[0]?.orderCount || '0'),
          avgTicket: parseFloat(salesQuery.rows[0]?.avgTicket || '0'),
          topProducts: topProducts.map((p: any) => ({
            ...p,
            units: parseFloat(p.units),
            total: parseFloat(p.total),
            percentage: totalSales > 0 ? (parseFloat(p.total) / totalSales * 100) : 0,
          })),
          topCustomers: [],
        };
      } catch (e: any) {
        console.warn('Sales report error:', e.message);
        result.sales = { totalSold: 0, orderCount: 0, avgTicket: 0, topProducts: [], topCustomers: [] };
      }
    }

    if (report === 'all' || report === 'inventory') {
      try {
        const inventoryQuery = await query(`
          SELECT
            COUNT(DISTINCT p.id) as "totalProducts",
            COALESCE(SUM(p.cost_price * COALESCE(sl.quantity, 0)), 0) as "totalValue",
            COUNT(DISTINCT CASE WHEN COALESCE(sl.quantity, 0) <= p.min_stock AND COALESCE(sl.quantity, 0) > 0 THEN p.id END) as "lowStock",
            COUNT(DISTINCT CASE WHEN COALESCE(sl.quantity, 0) = 0 THEN p.id END) as "outOfStock"
          FROM products p
          LEFT JOIN stock_levels sl ON sl.product_id = p.id ${warehouseId ? 'AND sl.warehouse_id = $4' : ''}
          WHERE p.company_id = $1 AND p.is_active = true
        `, warehouseId ? [companyId, dateFrom, dateTo, warehouseId] : [companyId, dateFrom, dateTo]);

        const productsQuery = await query(`
          SELECT
            p.id, p.name, p.sku, p.min_stock,
            COALESCE(SUM(sl.quantity), 0) as current_stock,
            CASE
              WHEN COALESCE(SUM(sl.quantity), 0) = 0 THEN 'out_of_stock'
              WHEN COALESCE(SUM(sl.quantity), 0) <= p.min_stock THEN 'low'
              ELSE 'ok'
            END as status
          FROM products p
          LEFT JOIN stock_levels sl ON sl.product_id = p.id ${warehouseId ? 'AND sl.warehouse_id = $4' : ''}
          WHERE p.company_id = $1 AND p.is_active = true
          GROUP BY p.id, p.name, p.sku, p.min_stock
          ORDER BY current_stock ASC
          LIMIT 20
        `, warehouseId ? [companyId, dateFrom, dateTo, warehouseId] : [companyId, dateFrom, dateTo]);

        result.inventory = {
          totalProducts: parseInt(inventoryQuery.rows[0]?.totalProducts || '0'),
          totalValue: parseFloat(inventoryQuery.rows[0]?.totalValue || '0'),
          lowStock: parseInt(inventoryQuery.rows[0]?.lowStock || '0'),
          outOfStock: parseInt(inventoryQuery.rows[0]?.outOfStock || '0'),
          products: productsQuery.rows.map((p: any) => ({
            ...p,
            current_stock: parseFloat(p.current_stock),
            min_stock: parseFloat(p.min_stock),
          })),
        };
      } catch (e: any) {
        console.warn('Inventory report error:', e.message);
        result.inventory = { totalProducts: 0, totalValue: 0, lowStock: 0, outOfStock: 0, products: [] };
      }
    }

    if (report === 'all' || report === 'financials') {
      result.financials = {
        totalIncome: result.sales?.totalSold || 0,
        totalExpenses: 0,
        netProfit: result.sales?.totalSold || 0,
        totalIva: 0,
        monthly: [],
      };
    }

    return successResponse(result);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
