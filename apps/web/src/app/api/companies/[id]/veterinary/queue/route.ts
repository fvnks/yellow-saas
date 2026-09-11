import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId(req);

    const result = await query(
      `SELECT a.id, a.appointment_time, a.reason, a.status, a.created_at,
              vp.name AS patient_name, vp.species,
              vc.full_name AS client_name, vc.phone AS client_phone,
              vs.name AS service_name,
              vepr.full_name AS professional_name,
              vr.name AS room_name,
              EXTRACT(EPOCH FROM (now() - a.created_at::timestamptz)) / 60 as wait_minutes
       FROM veterinary_appointments a
       LEFT JOIN veterinary_patients vp ON vp.id = a.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = a.client_id
       LEFT JOIN veterinary_services vs ON vs.id = a.service_id
       LEFT JOIN veterinary_professionals vepr ON vepr.id = a.professional_id
       LEFT JOIN veterinary_rooms vr ON vr.id = a.room_id
       WHERE a.company_id = $1
         AND a.status IN ('agendada', 'confirmada', 'en_espera', 'en_atencion')
         AND a.appointment_date = CURRENT_DATE
       ORDER BY
         CASE a.status
           WHEN 'en_atencion' THEN 1
           WHEN 'en_espera' THEN 2
           WHEN 'confirmada' THEN 3
           WHEN 'agendada' THEN 4
         END,
         a.appointment_time ASC`,
      [companyId]
    );

    const counts = await query(
      `SELECT status, COUNT(*) as count
       FROM veterinary_appointments
       WHERE company_id = $1
         AND status IN ('agendada', 'confirmada', 'en_espera', 'en_atencion')
         AND appointment_date = CURRENT_DATE
       GROUP BY status`,
      [companyId]
    );

    const countMap: Record<string, number> = {};
    counts.rows.forEach((r: any) => { countMap[r.status] = parseInt(r.count); });

    return successResponse({
      queue: result.rows,
      counts: {
        agendada: countMap.agendada || 0,
        confirmada: countMap.confirmada || 0,
        en_espera: countMap.en_espera || 0,
        en_atencion: countMap.en_atencion || 0,
        total: Object.values(countMap).reduce((a, b) => a + b, 0),
      },
    });
  } catch (error: any) {
    return errorResponse(error.message || 'Error al obtener cola de espera', 500);
  }
}
