import { query } from '../../../../../lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  isDemoMode,
} from '../../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string; warehouseId: string } }) {
  try {
    const { warehouseId } = params;

    if (isDemoMode) {
      return successResponse({
        zones: [
          { id: 'z1', name: 'Recepción', code: 'REC', color: '#10b981', x: 20, y: 20, width: 300, height: 200, sort_order: 0, shelves: [], positions: [
            { id: 'dp1', name: 'Carga 1', code: 'C1', x: 30, y: 40, width: 80, height: 60, capacity: 50, current_stock: 0, sort_order: 0, product: null },
            { id: 'dp2', name: 'Carga 2', code: 'C2', x: 130, y: 40, width: 80, height: 60, capacity: 50, current_stock: 0, sort_order: 1, product: null },
          ]},
          { id: 'z2', name: 'Almacenamiento A', code: 'ALA', color: '#6366f1', x: 340, y: 20, width: 450, height: 350, sort_order: 1, shelves: [
            { id: 's1', name: 'Estante A1', code: 'EA1', x: 20, y: 20, width: 410, height: 50, sort_order: 0 },
            { id: 's2', name: 'Estante A2', code: 'EA2', x: 20, y: 90, width: 410, height: 50, sort_order: 1 },
            { id: 's3', name: 'Estante A3', code: 'EA3', x: 20, y: 160, width: 410, height: 50, sort_order: 2 },
          ], positions: [
            { id: 'p1', name: 'A1-1', code: 'A1-1', x: 30, y: 30, width: 80, height: 60, capacity: 100, current_stock: 45, sort_order: 0, shelf_id: 's1', product: { id: '1', name: 'Laptop HP ProBook 450', sku: 'LP-HP-450' } },
            { id: 'p2', name: 'A1-2', code: 'A1-2', x: 130, y: 30, width: 80, height: 60, capacity: 100, current_stock: 80, sort_order: 1, shelf_id: 's1', product: { id: '2', name: 'Mouse Logitech MX Master 3S', sku: 'MS-LG-MX3' } },
            { id: 'p3', name: 'A1-3', code: 'A1-3', x: 230, y: 30, width: 80, height: 60, capacity: 100, current_stock: 0, sort_order: 2, shelf_id: 's1', product: null },
            { id: 'p4', name: 'A2-1', code: 'A2-1', x: 30, y: 100, width: 80, height: 60, capacity: 50, current_stock: 20, sort_order: 3, shelf_id: 's2', product: { id: '3', name: 'Monitor Dell 27" 4K', sku: 'MN-DELL-27' } },
            { id: 'p5', name: 'A2-2', code: 'A2-2', x: 130, y: 100, width: 80, height: 60, capacity: 50, current_stock: 0, sort_order: 4, shelf_id: 's2', product: null },
            { id: 'p6', name: 'A3-1', code: 'A3-1', x: 30, y: 170, width: 80, height: 60, capacity: 200, current_stock: 150, sort_order: 5, shelf_id: 's3', product: { id: '5', name: 'Disco SSD Samsung 980 PRO 1TB', sku: 'SSD-SAM-980' } },
          ]},
          { id: 'z3', name: 'Despacho', code: 'DES', color: '#f59e0b', x: 20, y: 240, width: 300, height: 180, sort_order: 2, shelves: [], positions: [
            { id: 'dp3', name: 'Despacho 1', code: 'D1', x: 30, y: 30, width: 100, height: 60, capacity: 30, current_stock: 0, sort_order: 6, product: null },
          ]},
        ],
      });
    }

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

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

    if (isDemoMode) {
      return successResponse({ saved: true, zones: body.zones || [] });
    }

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
