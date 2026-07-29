import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

const ALLOWED_COLUMNS: Record<string, string[]> = {
  product: ['name', 'sku', 'description', 'price', 'cost_price', 'sale_price', 'category_id', 'tax_id', 'unit_id', 'barcode', 'weight', 'volume', 'is_active', 'track_stock', 'image_url', 'notes', 'min_stock', 'max_stock'],
  warehouse: ['name', 'code', 'address', 'phone', 'email', 'manager', 'is_active', 'notes'],
  category: ['name', 'description', 'parent_id', 'is_active', 'sort_order', 'icon', 'color'],
  tax: ['name', 'rate', 'type', 'is_active', 'description', 'code'],
  uom: ['name', 'symbol', 'description', 'is_active', 'conversion_factor', 'base_unit'],
  cost_center: ['name', 'code', 'description', 'is_active', 'budget', 'parent_id'],
  supplier: ['name', 'email', 'phone', 'address', 'tax_id', 'contact_name', 'notes', 'is_active', 'payment_terms', 'website'],
  customer: ['name', 'email', 'phone', 'address', 'tax_id', 'contact_name', 'notes', 'is_active', 'credit_limit', 'payment_terms', 'type'],
};

function sanitizeColumns(entityType: string, payload: Record<string, any>): { columns: string; placeholders: string; values: any[] } {
  const allowed = ALLOWED_COLUMNS[entityType] || [];
  const validKeys = Object.keys(payload).filter(k => k !== 'id' && allowed.includes(k));
  const columns = validKeys.join(', ');
  const placeholders = validKeys.map((_, i) => `$${i + 2}`).join(', ');
  const values = validKeys.map(k => payload[k]);
  return { columns, placeholders, values };
}

function sanitizeSetClause(entityType: string, payload: Record<string, any>): { setClause: string; values: any[] } {
  const allowed = ALLOWED_COLUMNS[entityType] || [];
  const validKeys = Object.keys(payload).filter(k => allowed.includes(k));
  const setClause = validKeys.map((k, i) => `${k} = $${i + 3}`).join(', ');
  const values = validKeys.map(k => payload[k]);
  return { setClause, values };
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { action_type, entity_type, entity_id, payload } = body;

    if (!action_type || !entity_type || !payload) {
      return errorResponse('action_type, entity_type, and payload are required', 400);
    }

    switch (action_type) {
      case 'stock_adjust':
        await handleStockAdjust(companyId, payload);
        break;
      case 'stock_transfer':
        await handleStockTransfer(companyId, payload);
        break;
      case 'stock_receive':
        await handleStockReceive(companyId, payload);
        break;
      case 'create':
        await handleCreate(companyId, entity_type, payload);
        break;
      case 'update':
        await handleUpdate(companyId, entity_type, entity_id, payload);
        break;
      case 'delete':
        await handleDelete(companyId, entity_type, entity_id);
        break;
      case 'pick_start':
        await handlePickStart(companyId, payload);
        break;
      case 'pick_complete':
        await handlePickComplete(companyId, payload);
        break;
      case 'pick_short':
        await handlePickShort(companyId, payload);
        break;
      case 'count_start':
        await handleCountStart(companyId, payload);
        break;
      case 'count_item':
        await handleCountItem(companyId, payload);
        break;
      case 'count_complete':
        await handleCountComplete(companyId, payload);
        break;
      case 'receipt_start':
        await handleReceiptStart(companyId, payload);
        break;
      case 'receipt_item':
        await handleReceiptItem(companyId, payload);
        break;
      case 'receipt_complete':
        await handleReceiptComplete(companyId, payload);
        break;
      case 'inspection_start':
        await handleInspectionStart(companyId, payload);
        break;
      case 'inspection_item':
        await handleInspectionItem(companyId, payload);
        break;
      case 'inspection_complete':
        await handleInspectionComplete(companyId, payload);
        break;
      default:
        return errorResponse(`Unknown action_type: ${action_type}`, 400);
    }

    return successResponse({ success: true });
  } catch (err) {
    console.error('Sync offline action error:', err);
    return errorResponse('Internal server error', 500);
  }
}

async function handleStockAdjust(companyId: string, payload: any) {
  const { product_id, warehouse_id, quantity, reason, notes, cost_price } = payload;
  if (!product_id || !warehouse_id || quantity === undefined) throw new Error('Missing required fields for stock_adjust');

  const finalQuantity = quantity;
  const finalCost = cost_price || 0;

  const { rows: stockRows } = await query(
    `SELECT id, quantity FROM stock_levels WHERE company_id = $1 AND product_id = $2 AND warehouse_id = $3`,
    [companyId, payload.product_id, payload.warehouse_id]
  );

  if (stockRows[0]) {
    const newQty = stockRows[0].quantity + finalQuantity;
    await query(
      `UPDATE stock_levels SET quantity = $1, updated_at = NOW() WHERE id = $2`,
      [newQty, stockRows[0].id]
    );
  } else if (finalQuantity > 0) {
    await query(
      `INSERT INTO stock_levels (company_id, product_id, warehouse_id, quantity) VALUES ($1, $2, $3, $4)`,
      [companyId, payload.product_id, payload.warehouse_id, finalQuantity]
    );
  }

  await query(
    `INSERT INTO stock_movements (company_id, product_id, warehouse_id, type, quantity, unit_cost, reference_type, reference_id, notes)
     VALUES ($1, $2, $3, 'adjustment', $4, $5, 'manual', gen_random_uuid(), $6)`,
    [companyId, payload.product_id, payload.warehouse_id, finalQuantity, finalCost, payload.notes || 'Ajuste offline']
  );
}

async function handleStockTransfer(companyId: string, payload: any) {
  const { from_warehouse_id, to_warehouse_id, product_id, quantity } = payload;
  if (!from_warehouse_id || !to_warehouse_id || !product_id || !quantity) throw new Error('Missing required fields for stock_transfer');

  const { rows: fromStock } = await query(
    `SELECT quantity FROM stock_levels WHERE company_id = $1 AND product_id = $2 AND warehouse_id = $3`,
    [companyId, payload.product_id, payload.from_warehouse_id]
  );

  if (fromStock[0] && fromStock[0].quantity >= payload.quantity) {
    await query(
      `UPDATE stock_levels SET quantity = quantity - $1, updated_at = NOW() WHERE company_id = $2 AND product_id = $3 AND warehouse_id = $4`,
      [payload.quantity, companyId, payload.product_id, payload.from_warehouse_id]
    );
  } else {
    throw new Error('Insufficient stock in source warehouse');
  }

  const { rows: toStock } = await query(
    `SELECT id FROM stock_levels WHERE company_id = $1 AND product_id = $2 AND warehouse_id = $3`,
    [companyId, payload.product_id, payload.to_warehouse_id]
  );

  if (toStock[0]) {
    await query(
      `UPDATE stock_levels SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2`,
      [payload.quantity, toStock[0].id]
    );
  } else {
    await query(
      `INSERT INTO stock_levels (company_id, product_id, warehouse_id, quantity) VALUES ($1, $2, $3, $4)`,
      [companyId, payload.product_id, payload.to_warehouse_id, payload.quantity]
    );
  }

  await query(
    `INSERT INTO stock_movements (company_id, product_id, warehouse_id, type, quantity, notes)
     VALUES ($1, $2, $3, 'transfer_out', -$4, $5)`,
    [companyId, payload.product_id, payload.from_warehouse_id, payload.quantity, 'Transferencia offline']
  );

  await query(
    `INSERT INTO stock_movements (company_id, product_id, warehouse_id, type, quantity, notes)
     VALUES ($1, $2, $3, 'transfer_in', $4, $5)`,
    [companyId, payload.product_id, payload.to_warehouse_id, payload.quantity, 'Transferencia offline']
  );
}

async function handleStockReceive(companyId: string, payload: any) {
  const { product_id, warehouse_id, quantity, cost_price } = payload;
  if (!product_id || !warehouse_id || !quantity) throw new Error('Missing required fields for stock_receive');

  const { rows: stockRows } = await query(
    `SELECT id, quantity FROM stock_levels WHERE company_id = $1 AND product_id = $2 AND warehouse_id = $3`,
    [companyId, payload.product_id, payload.warehouse_id]
  );

  if (stockRows[0]) {
    await query(
      `UPDATE stock_levels SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2`,
      [payload.quantity, stockRows[0].id]
    );
  } else {
    await query(
      `INSERT INTO stock_levels (company_id, product_id, warehouse_id, quantity) VALUES ($1, $2, $3, $4)`,
      [companyId, payload.product_id, payload.warehouse_id, payload.quantity]
    );
  }

  await query(
    `INSERT INTO stock_movements (company_id, product_id, warehouse_id, type, quantity, unit_cost, reference_type, notes)
     VALUES ($1, $2, $3, 'in', $4, $5, 'receipt', 'Recepción offline')`,
    [companyId, payload.product_id, payload.warehouse_id, payload.quantity, payload.cost_price || 0]
  );
}

async function handleCreate(companyId: string, entityType: string, payload: any) {
  let tableName: string;

  switch (entityType) {
    case 'product': tableName = 'products'; break;
    case 'warehouse': tableName = 'warehouses'; break;
    case 'category': tableName = 'inventory_categories'; break;
    case 'tax': tableName = 'taxes'; break;
    case 'uom': tableName = 'units_of_measure'; break;
    case 'cost_center': tableName = 'cost_centers'; break;
    case 'supplier': tableName = 'suppliers'; break;
    case 'customer': tableName = 'customers'; break;
    default: throw new Error(`Unsupported entity type for create: ${entityType}`);
  }

  const { columns, placeholders, values } = sanitizeColumns(entityType, payload);
  if (!columns) throw new Error('No valid columns for create');

  await query(
    `INSERT INTO ${tableName} (company_id, ${columns}) VALUES ($1, ${placeholders})`,
    [companyId, ...values]
  );
}

async function handleUpdate(companyId: string, entityType: string, entityId: string, payload: any) {
  if (!entityId) throw new Error('entity_id required for update');

  let tableName: string;
  switch (entityType) {
    case 'product': tableName = 'products'; break;
    case 'warehouse': tableName = 'warehouses'; break;
    case 'category': tableName = 'inventory_categories'; break;
    case 'tax': tableName = 'taxes'; break;
    case 'uom': tableName = 'units_of_measure'; break;
    case 'cost_center': tableName = 'cost_centers'; break;
    case 'supplier': tableName = 'suppliers'; break;
    case 'customer': tableName = 'customers'; break;
    default: throw new Error(`Unsupported entity type for update: ${entityType}`);
  }

  const { setClause, values } = sanitizeSetClause(entityType, payload);
  if (!setClause) throw new Error('No valid columns for update');

  await query(
    `UPDATE ${tableName} SET ${setClause}, updated_at = NOW() WHERE id = $1 AND company_id = $2`,
    [entityId, companyId, ...values]
  );
}

async function handleDelete(companyId: string, entityType: string, entityId: string) {
  if (!entityId) throw new Error('entity_id required for delete');

  let tableName: string;
  switch (entityType) {
    case 'product': tableName = 'products'; break;
    case 'warehouse': tableName = 'warehouses'; break;
    case 'category': tableName = 'inventory_categories'; break;
    case 'tax': tableName = 'taxes'; break;
    case 'uom': tableName = 'units_of_measure'; break;
    case 'cost_center': tableName = 'cost_centers'; break;
    case 'supplier': tableName = 'suppliers'; break;
    case 'customer': tableName = 'customers'; break;
    default: throw new Error(`Unsupported entity type for delete: ${entityType}`);
  }

  await query(`DELETE FROM ${tableName} WHERE id = $1 AND company_id = $2`, [entityId, companyId]);
}

async function handlePickStart(companyId: string, payload: any) {
  await query(
    `UPDATE pick_tasks SET status = 'in_progress', started_at = NOW() WHERE id = $1 AND company_id = $2`,
    [payload.task_id, companyId]
  );
}

async function handlePickComplete(companyId: string, payload: any) {
  await query(
    `UPDATE pick_tasks SET status = 'completed', completed_at = NOW(), quantity_picked = $1 WHERE id = $2 AND company_id = $3`,
    [payload.quantity_picked, payload.task_id, companyId]
  );
}

async function handlePickShort(companyId: string, payload: any) {
  await query(
    `UPDATE pick_tasks SET status = 'short', completed_at = NOW(), quantity_picked = $1, notes = $2 WHERE id = $3 AND company_id = $4`,
    [payload.quantity_picked, payload.notes || 'Short pick offline', payload.task_id, companyId]
  );
}

async function handleCountStart(companyId: string, payload: any) {
  await query(
    `UPDATE inventory_counts SET status = 'in_progress', started_at = NOW() WHERE id = $1 AND company_id = $2`,
    [payload.count_id, companyId]
  );
}

async function handleCountItem(companyId: string, payload: any) {
  await query(
    `UPDATE inventory_count_items SET counted_quantity = $1, status = 'counted', notes = $2 WHERE id = $3 AND company_id = $4`,
    [payload.counted_quantity, payload.notes || '', payload.item_id, companyId]
  );
}

async function handleCountComplete(companyId: string, payload: any) {
  await query(
    `UPDATE inventory_counts SET status = 'completed', completed_at = NOW() WHERE id = $1 AND company_id = $2`,
    [payload.count_id, companyId]
  );
}

async function handleReceiptStart(companyId: string, payload: any) {
  await query(
    `UPDATE purchase_orders SET status = 'received', received_at = NOW() WHERE id = $1 AND company_id = $2`,
    [payload.order_id, companyId]
  );
}

async function handleReceiptItem(companyId: string, payload: any) {
  await handleStockReceive(companyId, { product_id: payload.product_id, warehouse_id: payload.warehouse_id, quantity: payload.quantity, cost_price: payload.cost_price });
  await query(
    `UPDATE purchase_order_items SET received_quantity = received_quantity + $1 WHERE id = $2 AND company_id = $3`,
    [payload.quantity, payload.item_id, companyId]
  );
}

async function handleReceiptComplete(companyId: string, payload: any) {
  await query(
    `UPDATE purchase_orders SET status = 'completed', completed_at = NOW() WHERE id = $1 AND company_id = $2`,
    [payload.order_id, companyId]
  );
}

async function handleInspectionStart(companyId: string, payload: any) {
  await query(
    `UPDATE quality_inspections SET status = 'in_progress', started_at = NOW() WHERE id = $1 AND company_id = $2`,
    [payload.inspection_id, companyId]
  );
}

async function handleInspectionItem(companyId: string, payload: any) {
  await query(
    `UPDATE quality_inspection_items SET result = $1, measured_value = $2, notes = $3 WHERE id = $4 AND company_id = $5`,
    [payload.result, payload.measured_value, payload.notes || '', payload.item_id, companyId]
  );
}

async function handleInspectionComplete(companyId: string, payload: any) {
  const { rows: items } = await query(
    `SELECT result FROM quality_inspection_items WHERE inspection_id = $1 AND company_id = $2`,
    [payload.inspection_id, companyId]
  );
  
  const allPassed = items.every((i: any) => i.result === 'pass');
  const status = allPassed ? 'approved' : 'rejected';

  await query(
    `UPDATE quality_inspections SET status = $1, completed_at = NOW() WHERE id = $2 AND company_id = $3`,
    [status, payload.inspection_id, companyId]
  );
}