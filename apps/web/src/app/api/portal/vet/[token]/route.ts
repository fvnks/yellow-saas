import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params;

    // Validate token
    const tokenResult = await query(
      `SELECT pt.*, p.name as patient_name, p.species, p.breed, p.gender, p.birth_date,
              p.current_weight_kg, p.microchip, p.color, p.allergies, p.notes as patient_notes,
              c.full_name as client_name, c.phone as client_phone, c.email as client_email,
              co.name as company_name
       FROM veterinary_portal_tokens pt
       JOIN veterinary_patients p ON p.id = pt.patient_id
       JOIN veterinary_clients c ON c.id = pt.client_id
       JOIN companies co ON co.id = pt.company_id
       WHERE pt.token = $1 AND pt.is_active = true
         AND (pt.expires_at IS NULL OR pt.expires_at > now())`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return errorResponse('Token inválido o expirado', 404);
    }

    const portalData = tokenResult.rows[0];
    const companyId = portalData.company_id;
    const patientId = portalData.patient_id;

    // Update access tracking
    await query(
      `UPDATE veterinary_portal_tokens SET last_accessed_at = now(), access_count = access_count + 1 WHERE token = $1`,
      [token]
    );

    // Get recent consultations (last 5)
    const consultations = await query(
      `SELECT id, consultation_date, chief_complaint, diagnosis, treatment_plan, notes
       FROM veterinary_consultations
       WHERE patient_id = $1 AND company_id = $2
       ORDER BY consultation_date DESC LIMIT 5`,
      [patientId, companyId]
    );

    // Get active prescriptions
    const prescriptions = await query(
      `SELECT pr.id, pr.prescription_date, pr.notes,
              json_agg(json_build_object(
                'medication_name', pi.medication_name,
                'dosage', pi.dosage,
                'frequency', pi.frequency,
                'duration_days', pi.duration_days
              )) as items
       FROM veterinary_prescriptions pr
       LEFT JOIN veterinary_prescription_items pi ON pi.prescription_id = pr.id
       WHERE pr.patient_id = $1 AND pr.company_id = $2
       GROUP BY pr.id
       ORDER BY pr.prescription_date DESC LIMIT 5`,
      [patientId, companyId]
    );

    // Get upcoming appointments
    const appointments = await query(
      `SELECT id, appointment_date, appointment_time, reason, status, service_name, professional_name
       FROM veterinary_appointments
       WHERE patient_id = $1 AND company_id = $2 AND appointment_date >= CURRENT_DATE
       ORDER BY appointment_date ASC, appointment_time ASC LIMIT 5`,
      [patientId, companyId]
    );

    // Get active hospitalizations
    const hospitalizations = await query(
      `SELECT id, admission_date, reason, status, notes
       FROM veterinary_hospitalizations
       WHERE patient_id = $1 AND company_id = $2 AND status = 'active'`,
      [patientId, companyId]
    );

    // Get pending reminders
    const reminders = await query(
      `SELECT id, reminder_date, reminder_type, message, status
       FROM veterinary_reminders
       WHERE patient_id = $1 AND company_id = $2 AND status = 'pendiente'
       ORDER BY reminder_date ASC LIMIT 5`,
      [patientId, companyId]
    );

    return successResponse({
      patient: {
        name: portalData.patient_name,
        species: portalData.species,
        breed: portalData.breed,
        gender: portalData.gender,
        birthDate: portalData.birth_date,
        weightKg: portalData.current_weight_kg,
        microchip: portalData.microchip,
        color: portalData.color,
        allergies: portalData.allergies,
        notes: portalData.patient_notes,
      },
      client: {
        name: portalData.client_name,
        phone: portalData.client_phone,
        email: portalData.client_email,
      },
      clinic: {
        name: portalData.company_name,
      },
      consultations: consultations.rows,
      prescriptions: prescriptions.rows.map((r: any) => ({
        ...r,
        items: r.items?.filter((i: any) => i.medication_name) || [],
      })),
      appointments: appointments.rows,
      hospitalizations: hospitalizations.rows,
      reminders: reminders.rows,
    });
  } catch (error: any) {
    return errorResponse(error.message || 'Error al acceder al portal', 500);
  }
}
