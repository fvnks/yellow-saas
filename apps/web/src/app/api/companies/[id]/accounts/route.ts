import { query } from '@/api/lib/db';
import { getCompanyId, paginatedResponse, successResponse, errorResponse, parseSearchParams } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, sort, order, offset } = parseSearchParams(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let whereClause = 'WHERE a.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (type && type !== 'all') {
      whereClause += ` AND a.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (searchParams.get('search')) {
      whereClause += ` AND (a.code ILIKE $${paramIndex} OR a.name ILIKE $${paramIndex})`;
      params.push(`%${searchParams.get('search')}%`);
      paramIndex++;
    }

    const allowedSort = ['code', 'name', 'type', 'balance', 'created_at'];
    const sortColumn = allowedSort.includes(sort) ? sort : 'code';

    const { rows } = await query(`
      SELECT a.id, a.code, a.name, a.type, a.parent_id, a.level, a.description,
        a.currency, a.is_active, a.is_system, a.created_at, a.updated_at,
        COALESCE(jel_bal.balance, 0) as balance
      FROM accounts a
      LEFT JOIN (
        SELECT account_id,
          COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0) as balance
        FROM journal_entry_lines
        GROUP BY account_id
      ) jel_bal ON jel_bal.account_id = a.id
      ${whereClause}
      ORDER BY a.${sortColumn} ${order === 'desc' ? 'DESC' : 'ASC'}
      OFFSET $${paramIndex} LIMIT $${paramIndex + 1}
    `, [...params, offset, limit]);

    const { rows: countRows } = await query(`SELECT COUNT(*) FROM accounts a ${whereClause}`, params);
    const total = parseInt(countRows[0]?.count || '0');

    return paginatedResponse(rows, total, page, limit);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { code, name, type, parent_id, description, currency } = body;

    if (!code || !name || !type) {
      return errorResponse('code, name, and type are required', 400);
    }

    const { rows } = await query(`
      INSERT INTO accounts (company_id, code, name, type, parent_id, description, currency)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [companyId, code, name, type, parent_id || null, description || null, currency || 'CLP']);

    return successResponse(rows[0], 201);
  } catch (err: any) {
    if (err.code === '23505') return errorResponse('Account code already exists', 409);
    return errorResponse(err.message, 500);
  }
}
