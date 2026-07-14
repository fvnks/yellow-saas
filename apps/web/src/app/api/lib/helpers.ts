import { NextRequest, NextResponse } from 'next/server';
import { query } from './db';

export async function getCompanyId(request: NextRequest): Promise<string | null> {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const companiesIndex = pathParts.indexOf('companies');
  if (companiesIndex === -1 || !pathParts[companiesIndex + 1]) return null;
  return pathParts[companiesIndex + 1];
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: { message } }, { status });
}

export function paginatedResponse(data: unknown[], total: number, page: number, limit: number) {
  return NextResponse.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export function parseSearchParams(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const search = url.searchParams.get('search') || '';
  const sort = url.searchParams.get('sort') || 'created_at';
  const order = url.searchParams.get('order') || 'desc';
  const offset = (page - 1) * limit;
  return { page, limit, search, sort, order, offset };
}

export async function checkAndCreateLowStockNotification(companyId: string, productId: string, warehouseId: string) {
  try {
    const result = await query(
      `SELECT p.name, p.sku, p.min_stock, sl.quantity
       FROM products p
       JOIN stock_levels sl ON sl.product_id = p.id AND sl.warehouse_id = $3
       WHERE p.id = $2 AND sl.company_id = $1`,
      [companyId, productId, warehouseId]
    );
    if (result.rows.length === 0) return;
    const row = result.rows[0];
    if (row.quantity > row.min_stock) return;

    const existing = await query(
      `SELECT id FROM notifications
       WHERE company_id = $1 AND type = 'low_stock' AND reference_type = 'product' AND reference_id = $2 AND read = false`,
      [companyId, productId]
    );
    if (existing.rows.length > 0) return;

    const title = row.quantity === 0 ? 'Producto sin stock' : 'Stock bajo';
    const message = row.quantity === 0
      ? `${row.name} (${row.sku}) no tiene stock disponible en esta bodega.`
      : `${row.name} (${row.sku}) tiene ${row.quantity} unidades, por debajo del mínimo de ${row.min_stock}.`;

    await query(
      `INSERT INTO notifications (company_id, type, title, message, reference_type, reference_id)
       VALUES ($1, 'low_stock', $2, $3, 'product', $4)`,
      [companyId, title, message, productId]
    );
  } catch (err) {
    console.error('Low stock notification error:', err);
  }
}