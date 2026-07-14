import { query } from '@/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const referenceType = url.searchParams.get('reference_type');
    const referenceId = url.searchParams.get('reference_id');
    const status = url.searchParams.get('status');
    const warehouseId = url.searchParams.get('warehouse_id');
    const inspectorId = url.searchParams.get('inspector_id');
    const fromDate = url.searchParams.get('from_date');
    const toDate = url.searchParams.get('to_date');

    let whereClause = 'WHERE qi.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (referenceType) {
      whereClause += ` AND qi.reference_type = $${paramIndex}`;
      params.push(referenceType);
      paramIndex++;
    }

    if (referenceId) {
      whereClause += ` AND qi.reference_id = $${paramIndex}`;
      params.push(referenceId);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND qi.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (warehouseId) {
      whereClause += ` AND qi.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    if (inspectorId) {
      whereClause += ` AND qi.inspector_id = $${paramIndex}`;
      params.push(inspectorId);
      paramIndex++;
    }

    if (fromDate) {
      whereClause += ` AND qi.created_at >= $${paramIndex}`;
      params.push(fromDate);
      paramIndex++;
    }

    if (toDate) {
      whereClause += ` AND qi.created_at <= $${paramIndex}`;
      params.push(toDate);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (qi.inspection_number ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM quality_inspections qi
       LEFT JOIN purchase_orders p ON qi.purchase_order_id = p.id
       ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT qi.*,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        json_build_object('id', i.id, 'name', i.name) as inspector,
        json_build_object('id', qc.id, 'name', qc.name) as checklist,
        json_build_object('id', po.id, 'order_number', po.order_number) as purchase_order,
        json_build_object('id', s.id, 'name', s.name) as supplier
       FROM quality_inspections qi
       LEFT JOIN warehouses w ON qi.warehouse_id = w.id
       LEFT JOIN profiles i ON qi.inspector_id = i.id
       LEFT JOIN quality_checklists qc ON qi.checklist_id = qc.id
       LEFT JOIN purchase_orders po ON qi.purchase_order_id = po.id
       LEFT JOIN suppliers s ON qi.supplier_id = s.id
       ${whereClause}
       ORDER BY qi.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Quality inspections error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const {
      inspection_number,
      reference_type,
      reference_id,
      purchase_order_id,
      supplier_id,
      warehouse_id,
      checklist_id,
      inspector_id,
      sample_size,
      notes,
    } = body;

    if (!inspection_number || !reference_type) {
      return errorResponse('inspection_number and reference_type are required', 400);
    }

    const validRefTypes = ['receipt', 'production', 'shipment', 'return', 'internal'];
    if (!validRefTypes.includes(reference_type)) {
      return errorResponse(`reference_type must be one of: ${validRefTypes.join(', ')}`, 400);
    }

    if (purchase_order_id) {
      const poCheck = await query('SELECT id FROM purchase_orders WHERE id = $1 AND company_id = $2', [purchase_order_id, companyId]);
      if (poCheck.rows.length === 0) return errorResponse('Purchase order not found', 404);
    }

    if (supplier_id) {
      const supCheck = await query('SELECT id FROM suppliers WHERE id = $1 AND company_id = $2', [supplier_id, companyId]);
      if (supCheck.rows.length === 0) return errorResponse('Supplier not found', 404);
    }

    const whCheck = await query('SELECT id FROM warehouses WHERE id = $1 AND company_id = $2', [warehouse_id, companyId]);
    if (whCheck.rows.length === 0) return errorResponse('Warehouse not found', 404);

    if (checklist_id) {
      const clCheck = await query('SELECT id FROM quality_checklists WHERE id = $1 AND company_id = $2', [checklist_id, companyId]);
      if (clCheck.rows.length === 0) return errorResponse('Checklist not found', 404);
    }

    if (inspector_id) {
      const inspCheck = await query('SELECT id FROM profiles WHERE id = $1 AND company_id = $2', [inspector_id, companyId]);
      if (inspCheck.rows.length === 0) return errorResponse('Inspector not found', 404);
    }

    const result = await query(
      `INSERT INTO quality_inspections (company_id, inspection_number, reference_type, reference_id, purchase_order_id, supplier_id, warehouse_id, checklist_id, inspector_id, sample_size, status, notes, started_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11, NOW())
       RETURNING *`,
      [companyId, inspection_number, reference_type, reference_id || null, purchase_order_id || null, supplier_id || null, warehouse_id, checklist_id || null, inspector_id || null, sample_size || null, notes || null]
    );

    const inspection = result.rows[0];

    if (checklist_id) {
      const items = await query(
        `SELECT * FROM quality_checklist_items WHERE checklist_id = $1 AND company_id = $2 ORDER BY sequence`,
        [checklist_id, companyId]
      );

      for (const item of items.rows) {
        await query(
          `INSERT INTO quality_inspection_items (company_id, inspection_id, checklist_item_id, product_id, result, notes)
           VALUES ($1, $2, $3, $4, 'pending', $5)`,
          [companyId, inspection.id, item.id, item.product_id || null, item.description]
        );
      }
    }

    return successResponse(inspection, 201);
  } catch (err) {
    console.error('Create quality inspection error:', err);
    return errorResponse('Internal server error', 500);
  }
}