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

/**
 * Secure getCompanyId: always validates JWT against company_id in the URL.
 * Legacy shim kept for compatibility; the real implementation lives in
 * apps/web/src/app/api/lib/helpers.ts and is preferred for new routes.
 */
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

/**
 * Atomic next document number using pg_advisory_xact_lock. Must be called inside
 * an existing transaction (pass the PoolClient). Prevents folio/folio-number
 * race conditions under concurrent inserts.
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
  return { number: `${prefix}-${String(counter).padStart(pad, '0')}`, counter };
}

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

export async function getCompanyIvaRate(companyId: string): Promise<number> {
  try {
    const { rows } = await query(
      `SELECT setting_value FROM company_settings WHERE company_id = $1 AND setting_key = 'iva_rate'`,
      [companyId],
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
