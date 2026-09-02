import { query } from '@/app/api/lib/db';

export async function getCalendarEvents(filters?: {
  dateFrom?: string;
  dateTo?: string;
  vehicleId?: string;
  companyId?: string;
}) {
  const company_id = filters?.companyId || process.env.COMPANY_ID || '';
  
  let whereClauses = ['company_id = $1'];
  const params: any[] = [company_id];
  let paramIndex = 2;
  
  if (filters?.dateFrom) {
    whereClauses.push(`appointment_date >= $${paramIndex++}`);
    params.push(filters.dateFrom);
  }
  if (filters?.dateTo) {
    whereClauses.push(`appointment_date <= $${paramIndex++}`);
    params.push(filters.dateTo);
  }
  if (filters?.vehicleId) {
    whereClauses.push(`vehicle_id = $${paramIndex++}`);
    params.push(filters.vehicleId);
  }
  
  const { rows } = await query(
    `SELECT * FROM auto_appointments WHERE ${whereClauses.join(' AND ')} ORDER BY appointment_date, start_time`,
    params
  );
  
  return rows;
}
