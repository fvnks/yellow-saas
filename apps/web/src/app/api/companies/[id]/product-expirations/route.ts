import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const daysAhead = parseInt(searchParams.get('days') || '90');

    let sql = `
      SELECT pe.*,
        p.name as product_name, p.sku,
        w.name as warehouse_name, w.code as warehouse_code
      FROM product_expirations pe
      JOIN products p ON p.id = pe.product_id
      JOIN warehouses w ON w.id = pe.warehouse_id
      WHERE pe.company_id = $1
    `;
    const sqlParams: any[] = [companyId];
    let idx = 2;

    if (status) {
      sql += ` AND pe.status = $${idx}`;
      sqlParams.push(status);
      idx++;
    }

    sql += ` ORDER BY pe.expiration_date ASC`;

    const { rows } = await query(sql, sqlParams);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

    const expiringSoon = rows.filter((r: any) =>
      r.status === 'active' && new Date(r.expiration_date) <= cutoffDate
    );

    const expired = rows.filter((r: any) =>
      r.status === 'active' && new Date(r.expiration_date) < new Date()
    );

    return successResponse({
      items: rows,
      expiringSoon: expiringSoon.length,
      expired: expired.length,
      total: rows.length,
    });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { product_id, warehouse_id, batch_number, quantity, expiration_date, notes } = body;

    if (!product_id || !warehouse_id || !expiration_date || !quantity) {
      return errorResponse('product_id, warehouse_id, quantity, expiration_date required', 400);
    }

    const { rows } = await query(
      `INSERT INTO product_expirations (company_id, product_id, warehouse_id, batch_number, quantity, expiration_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [companyId, product_id, warehouse_id, batch_number || '', quantity, expiration_date, notes || '']
    );
    return successResponse(rows[0], 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
