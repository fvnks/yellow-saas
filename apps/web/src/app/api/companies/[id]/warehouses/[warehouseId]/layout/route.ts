import { query } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string; warehouseId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { warehouseId } = params;

    const { rows: zones } = await query(
      `SELECT * FROM warehouse_zones WHERE warehouse_id = $1 AND company_id = $2 ORDER BY sort_order`,
      [warehouseId, companyId]
    );

    const { rows: shelves } = await query(
      `SELECT * FROM warehouse_shelves WHERE warehouse_id = $1 AND company_id = $2 ORDER BY sort_order`,
      [warehouseId, companyId]
    );

    const { rows: positions } = await query(
      `SELECT wp.*,
        (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = wp.product_id) as product
       FROM warehouse_positions wp
       WHERE wp.warehouse_id = $1 AND wp.company_id = $2
       ORDER BY wp.sort_order`,
      [warehouseId, companyId]
    );

    const layout = zones.map(zone => ({
      ...zone,
      shelves: shelves.filter(shelf => shelf.zone_id === zone.id),
      positions: positions
        .filter(pos => pos.zone_id === zone.id)
        .map(pos => ({
          ...pos,
          product: pos.product || null,
        })),
    }));

    return successResponse({ zones: layout });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; warehouseId: string } }) {
  try {
    const { warehouseId } = params;
    const body = await request.json();

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { zones } = body;

    if (!zones || !Array.isArray(zones)) {
      return errorResponse('Zones array is required', 400);
    }

    // Delete existing layout for this warehouse
    await query(`DELETE FROM warehouse_positions WHERE warehouse_id = $1 AND company_id = $2`, [warehouseId, companyId]);
    await query(`DELETE FROM warehouse_shelves WHERE warehouse_id = $1 AND company_id = $2`, [warehouseId, companyId]);
    await query(`DELETE FROM warehouse_zones WHERE warehouse_id = $1 AND company_id = $2`, [warehouseId, companyId]);

    // Insert new layout
    for (let zi = 0; zi < zones.length; zi++) {
      const zone = zones[zi];
      const { rows: zoneRows } = await query(
        `INSERT INTO warehouse_zones (company_id, warehouse_id, name, code, color, x, y, width, height, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
         RETURNING id`,
        [
          companyId, warehouseId, zone.name, zone.code || null, zone.color || '#6366f1',
          zone.x || 0, zone.y || 0, zone.width || 200, zone.height || 200, zi,
        ]
      );
      const zoneId = zoneRows[0].id;

      // Insert shelves
      if (zone.shelves && Array.isArray(zone.shelves)) {
        const shelfIdMap: Record<string, string> = {};
        for (let si = 0; si < zone.shelves.length; si++) {
          const shelf = zone.shelves[si];
          const { rows: shelfRows } = await query(
            `INSERT INTO warehouse_shelves (company_id, warehouse_id, zone_id, name, code, x, y, width, height, sort_order, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
             RETURNING id`,
            [
              companyId, warehouseId, zoneId, shelf.name, shelf.code || null,
              shelf.x || 0, shelf.y || 0, shelf.width || 100, shelf.height || 40, si,
            ]
          );
          if (shelf.id && shelfRows[0]) shelfIdMap[shelf.id] = shelfRows[0].id;
        }
      }

      // Insert positions (independent from shelves)
      if (zone.positions && Array.isArray(zone.positions)) {
        for (let pi = 0; pi < zone.positions.length; pi++) {
          const pos = zone.positions[pi];
          await query(
            `INSERT INTO warehouse_positions (company_id, warehouse_id, zone_id, shelf_id, name, code, x, y, width, height, capacity, current_stock, product_id, sort_order, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true)`,
            [
              companyId, warehouseId, zoneId, pos.shelf_id || null,
              pos.name, pos.code || null, pos.x || 0, pos.y || 0,
              pos.width || 60, pos.height || 60, pos.capacity || 0,
              pos.current_stock || 0, pos.product_id || null, pi,
            ]
          );
        }
      }
    }

    return successResponse({ saved: true });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}