import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let sql = `
      SELECT st.*,
        p.name as product_name, p.sku,
        fw.name as from_warehouse_name, fw.code as from_warehouse_code,
        tw.name as to_warehouse_name, tw.code as to_warehouse_code
      FROM stock_transfers st
      JOIN products p ON p.id = st.product_id
      JOIN warehouses fw ON fw.id = st.from_warehouse_id
      JOIN warehouses tw ON tw.id = st.to_warehouse_id
      WHERE st.company_id = $1
    `;
    const sqlParams: any[] = [companyId];

    if (status) {
      sql += ' AND st.status = $2';
      sqlParams.push(status);
    }

    sql += ' ORDER BY st.created_at DESC';

    const { rows } = await query(sql, sqlParams);
    return successResponse(rows);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { product_id, from_warehouse_id, to_warehouse_id, quantity, notes } = body;

    if (!product_id || !from_warehouse_id || !to_warehouse_id || !quantity) {
      return errorResponse('product_id, from_warehouse_id, to_warehouse_id, quantity required', 400);
    }

    if (from_warehouse_id === to_warehouse_id) {
      return errorResponse('Cannot transfer to same warehouse', 400);
    }

    if (quantity <= 0) {
      return errorResponse('Quantity must be positive', 400);
    }

    const { rows } = await query(
      `INSERT INTO stock_transfers (company_id, product_id, from_warehouse_id, to_warehouse_id, quantity, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [companyId, product_id, from_warehouse_id, to_warehouse_id, quantity, notes || '']
    );
    return successResponse(rows[0], 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
