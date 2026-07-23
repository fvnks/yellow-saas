import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const report = url.searchParams.get('report') || 'all';
    const dateFrom = url.searchParams.get('date_from') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const dateTo = url.searchParams.get('date_to') || new Date().toISOString().split('T')[0];
    const warehouseFilter = url.searchParams.get('warehouse');

    const result: Record<string, any> = {};

    if (report === 'all' || report === 'sales') {
      const salesWhere = `WHERE so.company_id = $1 AND so.created_at::date >= $2 AND so.created_at::date <= $3 AND so.status != 'cancelled'`;
      const salesParams = [companyId, dateFrom, dateTo];

      const [totalSalesRes, orderCountRes, topProductsRes, topCustomersRes] = await Promise.all([
        query(`SELECT COALESCE(SUM(total), 0) as total FROM sales_orders ${salesWhere}`, salesParams),
        query(`SELECT COUNT(*) as count FROM sales_orders ${salesWhere}`, salesParams),
        query(`
          SELECT p.id, p.name, p.sku, SUM(soi.quantity) as units, SUM(soi.line_total) as total
          FROM sales_order_items soi
          JOIN sales_orders so ON so.id = soi.order_id AND so.company_id = soi.company_id
          JOIN products p ON p.id = soi.product_id
          ${salesWhere}
          GROUP BY p.id, p.name, p.sku
          ORDER BY total DESC
          LIMIT 10
        `, salesParams),
        query(`
          SELECT c.id, c.name, c.tax_id, SUM(so.total) as total, COUNT(so.id) as orders
          FROM sales_orders so
          LEFT JOIN customers c ON c.id = so.customer_id
          ${salesWhere}
          GROUP BY c.id, c.name, c.tax_id
          ORDER BY total DESC
          LIMIT 5
        `, salesParams),
      ]);

      const totalSold = parseInt(totalSalesRes.rows[0]?.total || '0');
      const orderCount = parseInt(orderCountRes.rows[0]?.count || '0');
      const grandTotal = parseInt(topProductsRes.rows[0]?.total || '0') || totalSold;

      result.sales = {
        totalSold,
        orderCount,
        avgTicket: orderCount > 0 ? Math.round(totalSold / orderCount) : 0,
        topProducts: topProductsRes.rows.map(p => ({
          ...p,
          units: parseInt(p.units || '0'),
          total: parseInt(p.total || '0'),
          percentage: grandTotal > 0 ? Math.round((parseInt(p.total || '0') / grandTotal) * 100) : 0,
        })),
        topCustomers: topCustomersRes.rows.map(c => ({
          ...c,
          total: parseInt(c.total || '0'),
          orders: parseInt(c.orders || '0'),
        })),
      };
    }

    if (report === 'all' || report === 'inventory') {
      const stockWhere = warehouseFilter && warehouseFilter !== 'all'
        ? `WHERE sl.company_id = $1 AND sl.warehouse_id = $2`
        : `WHERE sl.company_id = $1`;
      const stockParams = warehouseFilter && warehouseFilter !== 'all'
        ? [companyId, warehouseFilter]
        : [companyId];

      const [productCountRes, stockSummaryRes, lowStockRes, outOfStockRes, inventoryValueRes] = await Promise.all([
        query(`SELECT COUNT(*) as count FROM products WHERE company_id = $1 AND is_active = true`, [companyId]),
        query(`
          SELECT p.id, p.name, p.sku, p.min_stock,
            COALESCE(SUM(sl.quantity), 0) as current_stock,
            w.id as warehouse_id, w.name as warehouse_name, w.code as warehouse_code
          FROM products p
          LEFT JOIN stock_levels sl ON sl.product_id = p.id AND sl.company_id = p.company_id
          LEFT JOIN warehouses w ON w.id = sl.warehouse_id AND w.company_id = p.company_id
          WHERE p.company_id = $1 AND p.is_active = true
          GROUP BY p.id, p.name, p.sku, p.min_stock, w.id, w.name, w.code
          ORDER BY p.name ASC
          LIMIT 200
        `, [companyId]),
        query(`
          SELECT COUNT(DISTINCT p.id) as count
          FROM products p
          JOIN stock_levels sl ON sl.product_id = p.id AND sl.company_id = p.company_id
          WHERE p.company_id = $1 AND p.is_active = true AND p.min_stock > 0 AND sl.quantity > 0 AND sl.quantity < p.min_stock
        `, [companyId]),
        query(`
          SELECT COUNT(DISTINCT p.id) as count
          FROM products p
          LEFT JOIN stock_levels sl ON sl.product_id = p.id AND sl.company_id = p.company_id
          WHERE p.company_id = $1 AND p.is_active = true
          GROUP BY p.id
          HAVING COALESCE(SUM(sl.quantity), 0) = 0
        `, [companyId]),
        query(`
          SELECT COALESCE(SUM(sl.quantity * COALESCE(p.cost_price, 0)), 0) as total_value
          FROM stock_levels sl
          JOIN products p ON p.id = sl.product_id AND p.company_id = sl.company_id
          WHERE sl.company_id = $1 AND p.is_active = true
        `, [companyId]),
      ]);

      result.inventory = {
        totalProducts: parseInt(productCountRes.rows[0]?.count || '0'),
        totalValue: parseInt(inventoryValueRes.rows[0]?.total_value || '0'),
        lowStock: parseInt(lowStockRes.rows[0]?.count || '0'),
        outOfStock: parseInt(outOfStockRes.rows[0]?.count || '0'),
        products: stockSummaryRes.rows.map(p => ({
          ...p,
          current_stock: parseInt(p.current_stock || '0'),
          min_stock: parseInt(p.min_stock || '0'),
          status: parseInt(p.current_stock || '0') === 0 ? 'out_of_stock'
            : parseInt(p.current_stock || '0') < parseInt(p.min_stock || '0') ? 'low'
            : 'normal',
        })),
      };
    }

    if (report === 'all' || report === 'financials') {
      const invoicesWhere = `WHERE i.company_id = $1 AND i.created_at::date >= $2 AND i.created_at::date <= $3`;
      const purchasesWhere = `WHERE po.company_id = $1 AND po.created_at::date >= $2 AND po.created_at::date <= $3`;
      const financialParams = [companyId, dateFrom, dateTo];

      const [incomeRes, purchasesRes, monthlyIncomeRes, monthlyPurchasesRes] = await Promise.all([
        query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices i ${invoicesWhere}`, financialParams),
        query(`SELECT COALESCE(SUM(total), 0) as total FROM purchase_orders po ${purchasesWhere}`, financialParams),
        query(`
          SELECT TO_CHAR(i.created_at, 'YYYY-MM') as month, SUM(total_amount) as income
          FROM invoices i ${invoicesWhere}
          GROUP BY TO_CHAR(i.created_at, 'YYYY-MM')
          ORDER BY month ASC
        `, financialParams),
        query(`
          SELECT TO_CHAR(po.created_at, 'YYYY-MM') as month, SUM(total) as expenses
          FROM purchase_orders po ${purchasesWhere}
          GROUP BY TO_CHAR(po.created_at, 'YYYY-MM')
          ORDER BY month ASC
        `, financialParams),
      ]);

      const totalIncome = parseInt(incomeRes.rows[0]?.total || '0');
      const totalExpenses = parseInt(purchasesRes.rows[0]?.total || '0');

      const monthlyMap: Record<string, { income: number; expenses: number }> = {};
      for (const row of monthlyIncomeRes.rows) {
        monthlyMap[row.month] = { income: parseInt(row.income || '0'), expenses: 0 };
      }
      for (const row of monthlyPurchasesRes.rows) {
        if (!monthlyMap[row.month]) monthlyMap[row.month] = { income: 0, expenses: 0 };
        monthlyMap[row.month].expenses = parseInt(row.expenses || '0');
      }

      const monthNames: Record<string, string> = {
        '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
        '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
        '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
      };

      result.financials = {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        totalIva: Math.round(totalIncome * 0.19),
        monthly: Object.entries(monthlyMap).map(([key, val]) => ({
          month: `${monthNames[key.split('-')[1]] || key.split('-')[1]} ${key.split('-')[0]}`,
          income: val.income,
          expenses: val.expenses,
          profit: val.income - val.expenses,
          iva: Math.round(val.income * 0.19),
        })).sort((a, b) => a.month.localeCompare(b.month)),
      };
    }

    return successResponse(result);
  } catch {
    return errorResponse('Failed to generate report', 500);
  }
}
