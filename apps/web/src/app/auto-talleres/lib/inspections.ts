import { query } from '@/app/api/lib/db';

export async function getInspections(filters?: {
  companyId?: string;
}) {
  const company_id = filters?.companyId || process.env.COMPANY_ID || '';
  
  const { rows } = await query(
    `SELECT * FROM auto_inspections WHERE company_id = $1 ORDER BY created_at DESC`,
    [company_id]
  );
  
  return rows;
}

export async function getInspectionById(id: string, companyId: string) {
  const { rows } = await query(
    'SELECT * FROM auto_inspections WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
  
  return rows[0] || null;
}
