import { query } from '@/app/api/lib/db';

export async function getDashboardStats(companyId: string) {
  // Get vehicle count
  const vehicleCountResult = await query(
    'SELECT COUNT(*) as count FROM auto_vehicles WHERE company_id = $1',
    [companyId]
  );
  
  // Get active orders count
  const activeOrdersResult = await query(
    `SELECT COUNT(*) as count FROM auto_work_orders 
     WHERE company_id = $1 AND status IN ('checkin', 'diagnostic', 'estimated', 'approved', 'waiting_parts', 'in_progress')`,
    [companyId]
  );
  
  // Get this month's revenue
  const startDate = new Date();
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  
  const revenueResult = await query(
    `SELECT COALESCE(SUM(total), 0) as total FROM auto_work_orders 
     WHERE company_id = $1 AND status = 'invoiced' AND created_at >= $2`,
    [companyId, startDate.toISOString()]
  );
  
  // Get active technicians count
  const technicianCountResult = await query(
    'SELECT COUNT(*) as count FROM auto_technicians WHERE company_id = $1 AND status = $2',
    [companyId, 'active']
  );
  
  // Get bay occupancy
  const baysResult = await query(
    'SELECT COUNT(*) as count FROM auto_bays WHERE company_id = $1 AND status = $2',
    [companyId, 'occupied']
  );
  
  return {
    vehicleCount: parseInt(vehicleCountResult.rows[0].count),
    activeOrdersCount: parseInt(activeOrdersResult.rows[0].count),
    totalRevenue: parseInt(revenueResult.rows[0].total),
    technicianCount: parseInt(technicianCountResult.rows[0].count),
    occupiedBays: parseInt(baysResult.rows[0].count),
  };
}

export async function getOrderStatusCounts(companyId: string) {
  const { rows } = await query(
    `SELECT status, COUNT(*) as count FROM auto_work_orders 
     WHERE company_id = $1 AND status IN ('checkin', 'diagnostic', 'estimated', 'approved', 'waiting_parts', 'in_progress', 'quality_check', 'ready')
     GROUP BY status`,
    [companyId]
  );
  
  const counts: Record<string, number> = {
    checkin: 0,
    diagnostic: 0,
    estimated: 0,
    approved: 0,
    waiting_parts: 0,
    in_progress: 0,
    quality_check: 0,
    ready: 0,
  };
  
  rows.forEach((row) => {
    counts[row.status] = parseInt(row.count);
  });
  
  return counts;
}

export async function getRecentOrders(companyId: string, limit = 5) {
  const { rows } = await query(
    `SELECT wo.id, wo.order_number, wo.status, wo.priority, wo.total, wo.created_at,
            av.patente, av.brand, av.model,
            c.nombre as client_name
     FROM auto_work_orders wo
     LEFT JOIN auto_vehicles av ON av.id = wo.vehicle_id
     LEFT JOIN customers c ON c.id = wo.client_id
     WHERE wo.company_id = $1
     ORDER BY wo.created_at DESC
     LIMIT $2`,
    [companyId, limit]
  );
  
  return rows;
}

export async function getBayOccupancyStats(companyId: string) {
  const { rows: bays } = await query(
    'SELECT id, number, type, status FROM auto_bays WHERE company_id = $1 ORDER BY number',
    [companyId]
  );
  
  const { rows: orders } = await query(
    `SELECT bay_id, status FROM auto_work_orders 
     WHERE company_id = $1 AND status IN ('checkin', 'diagnostic', 'estimated', 'approved', 'waiting_parts', 'in_progress')`,
    [companyId]
  );
  
  return bays.map((bay) => {
    const activeOrders = orders.filter((o) => o.bay_id === bay.id).length;
    return {
      ...bay,
      activeOrders,
      isOccupied: activeOrders > 0 || bay.status === 'occupied',
    };
  });
}
