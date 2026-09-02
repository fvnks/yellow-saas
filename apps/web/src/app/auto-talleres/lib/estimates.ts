import { query } from '@/app/api/lib/db';

export async function getEstimates(filters?: {
  orderId?: string;
  clientId?: string;
  status?: string;
  page?: number;
  limit?: number;
  companyId?: string;
}) {
  const company_id = filters?.companyId || process.env.COMPANY_ID || '';
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;
  
  let whereClauses = ['company_id = $1'];
  const params: any[] = [company_id];
  let paramIndex = 2;
  
  if (filters?.orderId) {
    whereClauses.push(`work_order_id = $${paramIndex++}`);
    params.push(filters.orderId);
  }
  if (filters?.clientId) {
    whereClauses.push(`client_id = $${paramIndex++}`);
    params.push(filters.clientId);
  }
  if (filters?.status) {
    whereClauses.push(`status = $${paramIndex++}`);
    params.push(filters.status);
  }
  
  const whereClause = whereClauses.join(' AND ');
  
  const { rows } = await query(
    `SELECT * FROM auto_estimates WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );
  
  const countResult = await query(
    `SELECT COUNT(*) FROM auto_estimates WHERE ${whereClause}`,
    params
  );
  
  return {
    estimates: rows,
    total: parseInt(countResult.rows[0].count),
  };
}
