import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(req.url);
    const supplierId = url.searchParams.get('supplierId');
    if (!supplierId) return errorResponse('supplierId is required', 400);

    const { rows: history } = await query(
      `SELECT poi.product_id, p.name as product_name, p.sku, poi.unit_price, poi.quantity, poi.line_total,
        po.created_at as order_date, po.order_number
       FROM purchase_order_items poi
       JOIN purchase_orders po ON po.id = poi.purchase_order_id
       JOIN products p ON p.id = poi.product_id
       WHERE po.company_id = $1 AND po.supplier_id = $2 AND po.status != 'cancelled'
       ORDER BY po.created_at DESC LIMIT 200`, [companyId, supplierId]);

    const productPrices = history.reduce((acc: any, h: any) => {
      const key = h.product_id;
      if (!acc[key]) acc[key] = { name: h.product_name, sku: h.sku, prices: [], minPrice: Infinity, maxPrice: 0, avgPrice: 0, totalQty: 0 };
      acc[key].prices.push({ price: parseFloat(h.unit_price), date: h.order_date, order: h.order_number, qty: parseInt(h.quantity) });
      acc[key].minPrice = Math.min(acc[key].minPrice, parseFloat(h.unit_price));
      acc[key].maxPrice = Math.max(acc[key].maxPrice, parseFloat(h.unit_price));
      acc[key].totalQty += parseInt(h.quantity);
      return acc;
    }, {});

    for (const key of Object.keys(productPrices)) {
      const pp = productPrices[key];
      pp.avgPrice = pp.prices.reduce((s: number, p: any) => s + p.price * p.qty, 0) / pp.totalQty;
    }

    return successResponse({ history, productPrices: Object.values(productPrices) });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
