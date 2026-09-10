import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const daysAhead = body.days_ahead || 14;
    const types = body.types || ['vacunacion', 'desparasitacion'];

    const createdReminders: any[] = [];
    const skippedExisting: number = 0;

    if (types.includes('vacunacion')) {
      const dueVaccinations = await query(
        `SELECT vv.*, vp.name AS patient_name, vp.species,
          vc.full_name AS client_name, vc.phone AS client_phone, vc.id AS client_id
         FROM veterinary_vaccinations vv
         JOIN veterinary_patients vp ON vp.id = vv.patient_id
         JOIN veterinary_clients vc ON vc.id = vp.client_id
         WHERE vv.company_id = $1
           AND vv.next_due_date IS NOT NULL
           AND vv.next_due_date <= CURRENT_DATE + INTERVAL '1 day' * $2
           AND vv.next_due_date >= CURRENT_DATE`,
        [companyId, daysAhead]
      );

      for (const vax of dueVaccinations.rows) {
        const existing = await query(
          `SELECT id FROM veterinary_reminders
           WHERE company_id = $1 AND patient_id = $2 AND type = 'vacunacion'
             AND due_date = $3 AND status IN ('pending', 'sent')`,
          [companyId, vax.patient_id, vax.next_due_date]
        );

        if (existing.rows.length > 0) continue;

        const result = await query(
          `INSERT INTO veterinary_reminders (company_id, patient_id, client_id, type, due_date, title, description, status)
           VALUES ($1, $2, $3, 'vacunacion', $4, $5, $6, 'pending')
           RETURNING *`,
          [
            companyId,
            vax.patient_id,
            vax.client_id,
            vax.next_due_date,
            `Vacuna pendiente: ${vax.vaccine_name}`,
            `Próxima dosis de ${vax.vaccine_name} para ${vax.patient_name} (${vax.species})`,
          ]
        );
        createdReminders.push(result.rows[0]);
      }
    }

    if (types.includes('desparasitacion')) {
      const dueDewormings = await query(
        `SELECT vd.*, vp.name AS patient_name, vp.species,
          vc.full_name AS client_name, vc.phone AS client_phone, vc.id AS client_id
         FROM veterinary_dewormings vd
         JOIN veterinary_patients vp ON vp.id = vd.patient_id
         JOIN veterinary_clients vc ON vc.id = vp.client_id
         WHERE vd.company_id = $1
           AND vd.next_due_date IS NOT NULL
           AND vd.next_due_date <= CURRENT_DATE + INTERVAL '1 day' * $2
           AND vd.next_due_date >= CURRENT_DATE`,
        [companyId, daysAhead]
      );

      for (const dew of dueDewormings.rows) {
        const existing = await query(
          `SELECT id FROM veterinary_reminders
           WHERE company_id = $1 AND patient_id = $2 AND type = 'desparasitacion'
             AND due_date = $3 AND status IN ('pending', 'sent')`,
          [companyId, dew.patient_id, dew.next_due_date]
        );

        if (existing.rows.length > 0) continue;

        const result = await query(
          `INSERT INTO veterinary_reminders (company_id, patient_id, client_id, type, due_date, title, description, status)
           VALUES ($1, $2, $3, 'desparasitacion', $4, $5, $6, 'pending')
           RETURNING *`,
          [
            companyId,
            dew.patient_id,
            dew.client_id,
            dew.next_due_date,
            `Desparasitación pendiente: ${dew.product_name}`,
            `Próxima desparasitación con ${dew.product_name} para ${dew.patient_name} (${dew.species})`,
          ]
        );
        createdReminders.push(result.rows[0]);
      }
    }

    return successResponse({
      created: createdReminders.length,
      reminders: createdReminders,
      days_ahead: daysAhead,
      types_checked: types,
    });
  } catch (error) {
    console.error('Error generating auto-reminders:', error);
    return errorResponse('Error al generar recordatorios automáticos', 500);
  }
}
