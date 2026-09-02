import { query } from '@/app/api/lib/db';

export async function getTechnicians(filters?: {
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
    `SELECT * FROM auto_technicians WHERE ${whereClause} ORDER BY full_name`,
    params
  );
  
  return rows;
}

export async function getTechnicianById(id: string, companyId: string) {
  const { rows } = await query(
    'SELECT * FROM auto_technicians WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
  
  return rows[0] || null;
}
