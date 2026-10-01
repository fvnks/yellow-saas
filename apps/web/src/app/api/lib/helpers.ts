import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { PoolClient } from 'pg';
import { getJwtSecret } from '@/lib/env';
import { query, transaction } from './db';

export type JwtPayload = {
  sub?: string;
  company_id?: string;
  role_type?: 'company' | 'super_admin';
  role?: string;
  email?: string;
  full_name?: string;
  [key: string]: unknown;
};

export async function verifyJwt(request: NextRequest): Promise<JwtPayload | null> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as JwtPayload;
  } catch (err) {
    console.error('Auth verification error:', err);
    return null;
  }
}

export async function getCompanyId(request: NextRequest): Promise<string | null> {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const companiesIndex = pathParts.indexOf('companies');
  if (companiesIndex === -1 || !pathParts[companiesIndex + 1]) return null;
  const urlCompanyId = pathParts[companiesIndex + 1];

  const payload = await verifyJwt(request);
  if (!payload) return null;

  if (payload.role_type === 'super_admin') return urlCompanyId;

  const jwtCompanyId = payload.company_id as string | undefined;
  if (!jwtCompanyId) return null;

  return jwtCompanyId === urlCompanyId ? urlCompanyId : null;
}

/**
 * Atomically allocate the next sequential document number for a company.
 * Uses a PostgreSQL advisory lock scoped to (company, table, prefix) so
 * concurrent inserts cannot observe the same COUNT(*) and produce duplicates.
 *
 * Examples:
 *   await nextDocumentNumber(client, companyId, 'invoices', 'factura', 'FE')
 *   await nextDocumentNumber(client, companyId, 'invoices', 'boleta',  'BF')
 *
 * Returns a formatted string like "FE-000042" plus the numeric counter.
 * Must be called inside a transaction (pass the PoolClient).
 */
export async function nextDocumentNumber(
  client: PoolClient,
  companyId: string,
  table: string,
  whereColumn: string,
  whereValue: string,
  numberColumn: string,
  prefix: string,
  pad = 6,
): Promise<{ number: string; counter: number }> {
  // Build a deterministic 64-bit key for pg_advisory_xact_lock from (company,table,discriminator)
  const keyHash = await client.query<{ h: bigint }>(
    `SELECT ('x' || substr(md5($1 || ':' || $2 || ':' || $3 || ':' || $4), 1, 16))::bit(64)::bigint AS h`,
    [companyId, table, whereColumn, whereValue],
  );
  const lockKey = keyHash.rows[0].h;
  await client.query(`SELECT pg_advisory_xact_lock($1)`, [lockKey.toString()]);

  const col = client.escapeIdentifier(numberColumn);
  const tbl = client.escapeIdentifier(table);
  const wcol = client.escapeIdentifier(whereColumn);
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS c FROM ${tbl} WHERE company_id = $1 AND ${wcol} = $2`,
    [companyId, whereValue],
  );
  const counter = (rows[0]?.c ?? 0) + 1;
  const number = `${prefix}-${String(counter).padStart(pad, '0')}`;
  return { number, counter };
}

/** Backwards-compatible wrapper: runs in its own transaction. Prefer the client-based overload inside an outer transaction. */
export async function nextDocumentNumberStandalone(
  companyId: string,
  table: string,
  whereColumn: string,
  whereValue: string,
  numberColumn: string,
  prefix: string,
  pad = 6,
): Promise<{ number: string; counter: number }> {
  return transaction(async (client) =>
    nextDocumentNumber(client, companyId, table, whereColumn, whereValue, numberColumn, prefix, pad),
  );
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: { message } }, { status });
}

export function paginatedResponse(data: unknown[], total: number, page: number, limit: number) {
  return NextResponse.json({
    success: true,
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

export async function getCompanyIvaRate(companyId: string): Promise<number> {
  try {
    const { rows } = await query(
      `SELECT setting_value FROM company_settings WHERE company_id = $1 AND setting_key = 'iva_rate'`,
      [companyId]
    );
    if (rows[0]) {
      const rate = parseFloat(rows[0].setting_value);
      if (rate > 0 && rate < 1) return rate;
    }
  } catch (err) {
    console.error('IVA rate lookup error:', err);
  }
  return 0.19;
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
       WHERE company_id = $1 AND type = $2 AND reference_type = $3 AND reference_id = $4 AND read = false`,
      [companyId, 'low_stock', 'product', productId]
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