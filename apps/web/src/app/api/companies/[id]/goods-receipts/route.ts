import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

const allowedStatus = ['pending', 'received', 'completed', 'cancelled'];
const allowedSortColumns = ['receipt_number', 'received_date', 'status', 'created_at'];

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);

    let whereClause = 'WHERE gr.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (gr.receipt_number ILIKE $${paramIndex} OR s.name ILIKE $${paramIndex} OR w.name ILIKE $${paramIndex} OR gr.notes ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const statusFilter = request.nextUrl.searchParams.get('status');
    if (statusFilter && allowedStatus.includes(statusFilter)) {
      whereClause += ` AND gr.status = $${paramIndex}`;
      params.push(statusFilter);
      paramIndex++;
    }

    const sortBy = allowedSortColumns.includes(sort || '') ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const countResult = await query(
      `SELECT COUNT(*) FROM goods_receipts gr
       LEFT JOIN suppliers s ON s.id = gr.supplier_id
       LEFT JOIN warehouses w ON w.id = gr.warehouse_id
       ${whereClause}`,
      params
    );

    const dataResult = await query(
       `SELECT gr.*, s.name as supplier_name, w.name as warehouse_name, po.number as order_number
       FROM goods_receipts gr
       LEFT JOIN suppliers s ON s.id = gr.supplier_id
       LEFT JOIN warehouses w ON w.id = gr.warehouse_id
       LEFT JOIN purchase_orders po ON po.id = gr.purchase_order_id
       ${whereClause}
       ORDER BY gr.${sortBy} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { purchase_order_id, supplier_id, warehouse_id, status, received_date, notes, created_by } = body;

    if (!purchase_order_id) return errorResponse('Purchase order is required', 400);
    if (!supplier_id) return errorResponse('Supplier is required', 400);
    if (!warehouse_id) return errorResponse('Warehouse is required', 400);
    if (status && !allowedStatus.includes(status)) return errorResponse('Invalid status', 400);

    const orderExists = await query(
      `SELECT id FROM purchase_orders WHERE company_id = $1 AND id = $2`,
      [companyId, purchase_order_id]
    );
    if (orderExists.rows.length === 0) return errorResponse('Purchase order not found', 404);

    const supplierExists = await query(
      `SELECT id FROM suppliers WHERE company_id = $1 AND id = $2`,
      [companyId, supplier_id]
    );
    if (supplierExists.rows.length === 0) return errorResponse('Supplier not found', 404);

    const warehouseExists = await query(
      `SELECT id FROM warehouses WHERE company_id = $1 AND id = $2`,
      [companyId, warehouse_id]
    );
    if (warehouseExists.rows.length === 0) return errorResponse('Warehouse not found', 404);

    const lastReceipt = await query(
      `SELECT receipt_number FROM goods_receipts WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [companyId]
    );

    let nextNumber = 1;
    if (lastReceipt.rows.length > 0) {
      const lastNum = parseInt(lastReceipt.rows[0].receipt_number.replace('GR-', ''));
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }
    const receiptNumber = `GR-${String(nextNumber).padStart(6, '0')}`;

    const result = await query(
      `INSERT INTO goods_receipts (company_id, receipt_number, purchase_order_id, supplier_id, warehouse_id, status, received_date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [companyId, receiptNumber, purchase_order_id, supplier_id, warehouse_id, status || 'pending', received_date || new Date().toISOString().split('T')[0], notes || null, created_by || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
