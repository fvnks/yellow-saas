import { query } from '@/app/api/lib/db';

export async function getBays(filters?: {
  companyId?: string;
  status?: string;
}) {
  const company_id = filters?.companyId || process.env.COMPANY_ID || '';
  
  let whereClause = 'company_id = $1';
  const params: any[] = [company_id];
  let paramIndex = 2;
  
  if (filters?.status) {
    whereClause += ` AND status = $${paramIndex++}`;
    params.push(filters.status);
  }
  
  const { rows } = await query(
    `SELECT * FROM auto_bays WHERE ${whereClause} ORDER BY number`,
    params
  );
  
  return rows;
}

export async function getActiveOrdersByBay(companyId: string) {
  const { rows } = await query(
    `SELECT wo.id, wo.bay_id, wo.status, wo.order_number, wo.vehicle_id
     FROM auto_work_orders wo
     WHERE wo.company_id = $1 AND wo.status IN ('checkin', 'diagnostic', 'estimated', 'approved', 'waiting_parts', 'in_progress')`,
    [companyId]
  );
  
  return rows;
}
