import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const [
      appointmentsResult,
      patientsResult,
      hospitalizationsResult,
      remindersResult,
    ] = await Promise.all([
      // Today's appointments with full detail for the agenda list
      query(
        `SELECT va.id, va.appointment_date, va.appointment_time, va.reason, va.status,
                vp.name as patient_name, vp.species, vp.breed,
                vc.full_name as client_name, vc.phone as client_phone,
                vs.name as service_name,
                vepr.full_name as professional_name
         FROM veterinary_appointments va
         LEFT JOIN veterinary_patients vp ON vp.id = va.patient_id
         LEFT JOIN veterinary_clients vc ON vc.id = va.client_id
         LEFT JOIN veterinary_services vs ON vs.id = va.service_id
         LEFT JOIN veterinary_professionals vepr ON vepr.id = va.professional_id
         WHERE va.company_id = $1 AND va.appointment_date = CURRENT_DATE
           AND va.status NOT IN ('cancelada', 'finalizada')
         ORDER BY va.appointment_time ASC`,
        [companyId]
      ),
      // Active patients
      query(
        `SELECT id, name, species, breed, sex,
                (microchip_number IS NOT NULL) as has_chip,
                (is_sterilized = true) as is_sterilized
         FROM veterinary_patients
         WHERE company_id = $1 AND status = 'active'
         ORDER BY name ASC`,
        [companyId]
      ),
      // Active hospitalizations
      query(
        `SELECT vh.id, vh.priority, vh.cage_number, vh.initial_diagnosis,
                vp.name as patient_name,
                vepr.full_name as attending_vet_name
         FROM veterinary_hospitalizations vh
         LEFT JOIN veterinary_patients vp ON vp.id = vh.patient_id
         LEFT JOIN veterinary_professionals vepr ON vepr.id = vh.attending_vet_id
         WHERE vh.company_id = $1 AND vh.status = 'active'
         ORDER BY vh.priority ASC, vh.admitted_at DESC`,
        [companyId]
      ),
      // Pending reminders (vaccines + deworming)
      query(
        `SELECT vr.id, vr.title, vr.due_date,
                vp.name as patient_name,
                vc.full_name as client_name
         FROM veterinary_reminders vr
         LEFT JOIN veterinary_patients vp ON vp.id = vr.patient_id
         LEFT JOIN veterinary_clients vc ON vc.id = vr.client_id
         WHERE vr.company_id = $1 AND vr.status = 'pending'
         ORDER BY vr.due_date ASC`,
        [companyId]
      ),
    ]);

    return successResponse({
      appointments: appointmentsResult.rows.map((r) => ({
        id: r.id,
        appointmentTime: r.appointment_time,
        patientName: r.patient_name,
        species: r.species,
        breed: r.breed,
        status: r.status,
        clientName: r.client_name,
        clientPhone: r.client_phone,
        serviceName: r.service_name,
        professionalName: r.professional_name,
      })),
      patients: patientsResult.rows.map((r) => ({
        id: r.id,
        name: r.name,
        species: r.species,
        breed: r.breed,
        hasChip: r.has_chip,
        isSterilized: r.is_sterilized,
      })),
      hospitalizations: hospitalizationsResult.rows.map((r) => ({
        id: r.id,
        patientName: r.patient_name,
        priority: r.priority,
        cageNumber: r.cage_number,
        initialDiagnosis: r.initial_diagnosis,
        attendingVetName: r.attending_vet_name,
      })),
      reminders: remindersResult.rows.map((r) => ({
        id: r.id,
        title: r.title,
        patientName: r.patient_name,
        clientName: r.client_name,
        dueDate: r.due_date,
      })),
    });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
