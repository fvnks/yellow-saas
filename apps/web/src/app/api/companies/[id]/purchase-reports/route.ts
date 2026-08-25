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

    if (type === 'monthly') {
      const { rows } = await query(
        `SELECT EXTRACT(MONTH FROM created_at) as month, SUM(total_amount) as total, COUNT(*) as order_count, AVG(total_amount) as avg_order
         FROM purchase_orders WHERE company_id = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND status != 'cancelled'
         GROUP BY EXTRACT(MONTH FROM created_at) ORDER BY month`, [companyId, year]);
      return successResponse(rows);
    }

    if (type === 'by-supplier') {
      const { rows } = await query(
        `SELECT s.name, s.tax_id, SUM(po.total_amount) as total, COUNT(*) as order_count
         FROM purchase_orders po JOIN suppliers s ON s.id = po.supplier_id
         WHERE po.company_id = $1 AND EXTRACT(YEAR FROM po.created_at) = $2 AND po.status != 'cancelled'
         GROUP BY s.id, s.name, s.tax_id ORDER BY total DESC`, [companyId, year]);
      return successResponse(rows);
    }

    if (type === 'by-product') {
      const { rows } = await query(
        `SELECT p.name, p.sku, SUM(poi.quantity) as qty, SUM(poi.line_total) as total
         FROM purchase_order_items poi JOIN purchase_orders po ON po.id = poi.purchase_order_id
         JOIN products p ON p.id = poi.product_id
         WHERE po.company_id = $1 AND EXTRACT(YEAR FROM po.created_at) = $2 AND po.status != 'cancelled'
         GROUP BY p.id, p.name, p.sku ORDER BY total DESC`, [companyId, year]);
      return successResponse(rows);
    }

    const { rows: totalPo } = await query(
      `SELECT SUM(total_amount) as total, COUNT(*) as count, AVG(total_amount) as avg_order
       FROM purchase_orders WHERE company_id = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND status != 'cancelled'`,
      [companyId, year]);
    const { rows: totalInvoiced } = await query(
      `SELECT SUM(total_amount) as total, SUM(paid_amount) as paid
       FROM purchase_invoices WHERE company_id = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND status != 'cancelled'`,
      [companyId, year]);
    const { rows: topSuppliers } = await query(
      `SELECT s.name, SUM(po.total_amount) as total, COUNT(*) as count
       FROM purchase_orders po JOIN suppliers s ON s.id = po.supplier_id
       WHERE po.company_id = $1 AND EXTRACT(YEAR FROM po.created_at) = $2 AND po.status != 'cancelled'
       GROUP BY s.id, s.name ORDER BY total DESC LIMIT 5`, [companyId, year]);
    const { rows: statusBreakdown } = await query(
      `SELECT status, COUNT(*) as count, SUM(total_amount) as total
       FROM purchase_orders WHERE company_id = $1 AND EXTRACT(YEAR FROM created_at) = $2 GROUP BY status`, [companyId, year]);

    return successResponse({ summary: totalPo[0], invoicing: totalInvoiced[0], topSuppliers, statusBreakdown });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
