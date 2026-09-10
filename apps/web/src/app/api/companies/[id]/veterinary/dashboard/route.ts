import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const [
      appointmentsToday,
      appointmentsByStatus,
      activePatients,
      activeHospitalizations,
      pendingReminders,
      recentConsultations,
      upcomingAppointments,
      overdueVaccinations,
    ] = await Promise.all([
      query(
        `SELECT COUNT(*) as count FROM veterinary_appointments
         WHERE company_id = $1 AND appointment_date = CURRENT_DATE`,
        [companyId]
      ),
      query(
        `SELECT status, COUNT(*)::int as count FROM veterinary_appointments
         WHERE company_id = $1 AND appointment_date >= CURRENT_DATE
         GROUP BY status ORDER BY count DESC`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as count FROM veterinary_patients
         WHERE company_id = $1 AND status = 'active'`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as count FROM veterinary_hospitalizations
         WHERE company_id = $1 AND status = 'active'`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as count FROM veterinary_reminders
         WHERE company_id = $1 AND status = 'pending' AND due_date <= CURRENT_DATE`,
        [companyId]
      ),
      query(
        `SELECT vc.diagnosis, vc.created_at as date, vp.name as patient_name
         FROM veterinary_consultations vc
         LEFT JOIN veterinary_patients vp ON vp.id = vc.patient_id
         WHERE vc.company_id = $1
         ORDER BY vc.created_at DESC LIMIT 5`,
        [companyId]
      ),
      query(
        `SELECT va.appointment_date, va.reason, vp.name as patient_name,
          vc.full_name as client_name, vepr.full_name as professional_name
         FROM veterinary_appointments va
         LEFT JOIN veterinary_patients vp ON vp.id = va.patient_id
         LEFT JOIN veterinary_clients vc ON vc.id = va.client_id
         LEFT JOIN veterinary_professionals vepr ON vepr.id = va.professional_id
         WHERE va.company_id = $1 AND va.appointment_date >= CURRENT_DATE AND va.status NOT IN ('cancelada', 'finalizada')
         ORDER BY va.appointment_date ASC LIMIT 5`,
        [companyId]
      ),
      query(
        `SELECT vv.next_due_date, vp.name as patient_name, vv.vaccine_name
         FROM veterinary_vaccinations vv
         LEFT JOIN veterinary_patients vp ON vp.id = vv.patient_id
         WHERE vv.company_id = $1 AND vv.next_due_date < CURRENT_DATE
           AND vp.status = 'active'
         ORDER BY vv.next_due_date ASC`,
        [companyId]
      ),
    ]);

    return successResponse({
      appointments_today: parseInt(appointmentsToday.rows[0]?.count || '0'),
      appointments_by_status: appointmentsByStatus.rows,
      active_patients: parseInt(activePatients.rows[0]?.count || '0'),
      active_hospitalizations: parseInt(activeHospitalizations.rows[0]?.count || '0'),
      pending_reminders: parseInt(pendingReminders.rows[0]?.count || '0'),
      recent_consultations: recentConsultations.rows,
      upcoming_appointments: upcomingAppointments.rows,
      overdue_vaccinations: overdueVaccinations.rows,
    });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
