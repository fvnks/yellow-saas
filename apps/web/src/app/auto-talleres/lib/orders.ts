import { query } from '@/app/api/lib/db';

export async function getOrders(filters?: {
  status?: string;
  vehicleId?: string;
  clientId?: string;
  search?: string;
  page?: number;
  limit?: number;
  companyId?: string;
}) {
  const company_id = filters?.companyId || process.env.COMPANY_ID || '';
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;
  
  let whereClauses = ['wo.company_id = $1'];
  const params: any[] = [company_id];
  let paramIndex = 2;
  
  if (filters?.status) {
    whereClauses.push(`wo.status = $${paramIndex++}`);
    params.push(filters.status);
  }
  if (filters?.vehicleId) {
    whereClauses.push(`wo.vehicle_id = $${paramIndex++}`);
    params.push(filters.vehicleId);
  }
  if (filters?.clientId) {
    whereClauses.push(`wo.client_id = $${paramIndex++}`);
    params.push(filters.clientId);
  }
  if (filters?.search) {
    whereClauses.push(`(wo.order_number ILIKE $${paramIndex} OR wo.customer_complaint ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }
  
  const whereClause = whereClauses.join(' AND ');
  
  const countResult = await query(
    `SELECT COUNT(*) FROM auto_work_orders wo WHERE ${whereClause}`,
    params.slice(0, -1)
  );
  
  const { rows } = await query(
    `SELECT wo.*, 
            av.plate, av.brand as marca, av.model as modelo, av.year as anio, av.color,
            c.nombre as client_name, c.rut as client_rut, c.email, c.telefono,
            at.full_name as technician_name, at.specialization as especialidad
     FROM auto_work_orders wo
     LEFT JOIN auto_vehicles av ON av.id = wo.vehicle_id
     LEFT JOIN customers c ON c.id = wo.client_id
     LEFT JOIN auto_technicians at ON at.id = wo.service_writer_id
     WHERE ${whereClause}
     ORDER BY wo.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );
  
  return {
    orders: rows,
    total: parseInt(countResult.rows[0].count),
  };
}

export async function getOrderById(id: string, companyId: string) {
  const { rows } = await query(
    `SELECT wo.*, 
            av.plate, av.brand as marca, av.model as modelo, av.year as anio, av.color,
            c.nombre as client_name, c.rut as client_rut, c.email, c.telefono,
            at.full_name as technician_name, at.specialization as especialidad
     FROM auto_work_orders wo
     LEFT JOIN auto_vehicles av ON av.id = wo.vehicle_id
     LEFT JOIN customers c ON c.id = wo.client_id
     LEFT JOIN auto_technicians at ON at.id = wo.service_writer_id
     WHERE wo.id = $1 AND wo.company_id = $2`,
    [id, companyId]
  );
  
  return rows[0] || null;
}

export async function createOrder(order: {
  company_id: string;
  vehicle_id: string;
  client_id: string;
  technician_id: string;
  bay_id: string;
  status: string;
  priority: string;
  description: string;
  notes?: string;
  subtotal?: number;
  iva?: number;
  total?: number;
}) {
  const order_number = `OT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
  
  const { rows } = await query(
    `INSERT INTO auto_work_orders (
      id, company_id, order_number, vehicle_id, client_id, service_writer_id, bay_id,
      status, priority, customer_complaint, notes, subtotal, iva_amount, total
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
    ) RETURNING *`,
    [
      order.company_id,
      order_number,
      order.vehicle_id,
      order.client_id,
      order.technician_id,
      order.bay_id,
      order.status,
      order.priority,
      order.description || null,
      order.notes || null,
      order.subtotal || 0,
      order.iva || 0,
      order.total || 0,
    ]
  );
  
  return rows[0];
}

export async function updateOrder(id: string, updates: Partial<any>, companyId: string) {
  const setClauses = Object.keys(updates)
    .filter(key => updates[key] !== undefined)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');
  
  const values = [...Object.values(updates).filter(v => v !== undefined), id, companyId];
  
  const { rows } = await query(
    `UPDATE auto_work_orders SET ${setClauses}, updated_at = NOW() 
     WHERE id = $${values.length} AND company_id = $${values.length + 1} 
     RETURNING *`,
    values
  );
  
  return rows[0] || null;
}

export async function deleteOrder(id: string, companyId: string) {
  await query(
    'DELETE FROM auto_work_orders WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
}
