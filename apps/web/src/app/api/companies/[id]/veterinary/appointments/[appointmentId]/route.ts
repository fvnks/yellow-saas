import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; appointmentId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(`
      SELECT a.*,
        json_build_object('id', p.id, 'name', p.name, 'species', p.species, 'breed', p.breed) as patient,
        json_build_object('id', cl.id, 'full_name', cl.full_name, 'phone', cl.phone, 'email', cl.email) as client,
        json_build_object('id', pr.id, 'full_name', pr.full_name, 'specialty', pr.specialty) as professional,
        json_build_object('id', s.id, 'name', s.name, 'price', s.price) as service,
        json_build_object('id', rm.id, 'name', rm.name, 'type', rm.type) as room
      FROM veterinary_appointments a
      LEFT JOIN veterinary_patients p ON p.id = a.patient_id
      LEFT JOIN veterinary_clients cl ON cl.id = a.client_id
      LEFT JOIN veterinary_professionals pr ON pr.id = a.professional_id
      LEFT JOIN veterinary_services s ON s.id = a.service_id
      LEFT JOIN veterinary_rooms rm ON rm.id = a.room_id
      WHERE a.id = $1 AND a.company_id = $2
    `, [params.appointmentId, companyId]);

    if (!rows[0]) return errorResponse('Appointment not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch appointment', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; appointmentId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const {
      patient_id, client_id, professional_id, service_id, room_id,
      appointment_date, appointment_time, duration_minutes,
      reason, notes, status
    } = body;

    if (status) {
      const validStatuses = ['agendada', 'confirmada', 'en_espera', 'en_atencion', 'finalizada', 'cancelada', 'no_asistio'];
      if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400);
    }

    const { rows } = await query(
      `UPDATE veterinary_appointments SET
        patient_id = COALESCE($1, patient_id), client_id = COALESCE($2, client_id),
        professional_id = $3, service_id = $4, room_id = $5,
        appointment_date = COALESCE($6, appointment_date), appointment_time = COALESCE($7, appointment_time),
        duration_minutes = COALESCE($8, duration_minutes), reason = $9, notes = $10,
        status = COALESCE($11, status), updated_at = NOW()
       WHERE id = $12 AND company_id = $13
       RETURNING *`,
      [
        patient_id || null, client_id || null,
        professional_id !== undefined ? professional_id : undefined,
        service_id !== undefined ? service_id : undefined,
        room_id !== undefined ? room_id : undefined,
        appointment_date || null, appointment_time || null,
        duration_minutes || null,
        reason !== undefined ? reason : undefined,
        notes !== undefined ? notes : undefined,
        status || null,
        params.appointmentId, companyId
      ]
    );

    if (!rows[0]) return errorResponse('Appointment not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update appointment', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; appointmentId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      'DELETE FROM veterinary_appointments WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.appointmentId, companyId]
    );

    if (!rows[0]) return errorResponse('Appointment not found', 404);

    return successResponse({ message: 'Appointment deleted successfully' });
  } catch {
    return errorResponse('Failed to delete appointment', 500);
  }
}
