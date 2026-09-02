import { query } from '@/app/api/lib/db';

export async function getSupplierOrders(filters?: {
  orderId?: string;
  supplierId?: string;
  status?: string;
  companyId?: string;
}) {
  const company_id = filters?.companyId || process.env.COMPANY_ID || '';
  
  let whereClauses = ['company_id = $1'];
  const params: any[] = [company_id];
  let paramIndex = 2;
  
  if (filters?.orderId) {
    whereClauses.push(`work_order_id = $${paramIndex++}`);
    params.push(filters.orderId);
  }
  if (filters?.supplierId) {
    whereClauses.push(`supplier_id = $${paramIndex++}`);
    params.push(filters.supplierId);
  }
  if (filters?.status) {
    whereClauses.push(`status = $${paramIndex++}`);
    params.push(filters.status);
  }
  
  const { rows } = await query(
    `SELECT * FROM auto_parts_orders WHERE ${whereClauses.join(' AND ')} ORDER BY created_at DESC`,
    params
  );
  
  return rows;
}
