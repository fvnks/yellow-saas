import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('product_id');
    const warehouseId = searchParams.get('warehouse_id');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
      SELECT sm.*,
        p.name as product_name, p.sku,
        w.name as warehouse_name, w.code as warehouse_code
      FROM stock_movements sm
      JOIN products p ON p.id = sm.product_id
      JOIN warehouses w ON w.id = sm.warehouse_id
      WHERE sm.company_id = $1
    `;
    const sqlParams: any[] = [companyId];
    let idx = 2;

    if (productId) {
      sql += ` AND sm.product_id = $${idx}`;
      sqlParams.push(productId);
      idx++;
    }
    if (warehouseId) {
      sql += ` AND sm.warehouse_id = $${idx}`;
      sqlParams.push(warehouseId);
      idx++;
    }
    if (type) {
      sql += ` AND sm.type = $${idx}`;
      sqlParams.push(type);
      idx++;
    }

    sql += ' ORDER BY sm.created_at DESC';
    sql += ` LIMIT $${idx} OFFSET $${idx + 1}`;
    sqlParams.push(limit, offset);

    const { rows } = await query(sql, sqlParams);

    let countSql = 'SELECT COUNT(*) FROM stock_movements WHERE company_id = $1';
    const countParams: any[] = [companyId];
    let countIdx = 2;
    if (productId) { countSql += ` AND product_id = $${countIdx}`; countParams.push(productId); countIdx++; }
    if (warehouseId) { countSql += ` AND warehouse_id = $${countIdx}`; countParams.push(warehouseId); countIdx++; }
    if (type) { countSql += ` AND type = $${countIdx}`; countParams.push(type); countIdx++; }

    const { rows: countRows } = await query(countSql, countParams);

    return successResponse({
      movements: rows,
      total: parseInt(countRows[0]?.count || '0'),
    });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
