import { query } from '@/app/api/lib/db';

export async function getCompanyConfig(companyId: string) {
  const { rows } = await query(
    'SELECT * FROM company_config WHERE company_id = $1',
    [companyId]
  );
  
  return rows[0] || null;
}

export async function updateCompanyConfig(companyId: string, updates: Record<string, any>) {
  const setClauses = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');
  
  const values = [...Object.values(updates), companyId];
  
  const { rows } = await query(
    `UPDATE company_config SET ${setClauses} WHERE company_id = $1 RETURNING *`,
    [...values, companyId]
  );
  
  return rows[0] || null;
}
