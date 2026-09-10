import { NextRequest } from 'next/server';
import { query, transaction } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

async function getPrescriptionWithItems(companyId: string, prescriptionId: string) {
  const result = await query(
    `SELECT vp.*,
      vpt.name AS patient_name, vpt.species AS patient_species,
      vc.full_name AS client_name,
      vpr.full_name AS professional_name,
      COALESCE(
        (SELECT json_agg(json_build_object(
          'id', vpi.id, 'medication_name', vpi.medication_name, 'active_ingredient', vpi.active_ingredient,
          'presentation', vpi.presentation, 'dose', vpi.dose, 'frequency', vpi.frequency,
          'duration', vpi.duration, 'route', vpi.route, 'quantity', vpi.quantity,
          'special_instructions', vpi.special_instructions
        )) FROM veterinary_prescription_items vpi WHERE vpi.prescription_id = vp.id), '[]'
      ) as items
     FROM veterinary_prescriptions vp
     LEFT JOIN veterinary_patients vpt ON vpt.id = vp.patient_id
     LEFT JOIN veterinary_clients vc ON vc.id = vp.client_id
     LEFT JOIN veterinary_professionals vpr ON vpr.id = vp.professional_id
     WHERE vp.id = $1 AND vp.company_id = $2`,
    [prescriptionId, companyId]
  );
  return result.rows[0] || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; prescriptionId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);
    const { prescriptionId } = params;

    const prescription = await getPrescriptionWithItems(companyId, prescriptionId);

    if (!prescription) {
      return errorResponse('Prescripción no encontrada', 404);
    }

    return successResponse(prescription);
  } catch (error) {
    return errorResponse('Error al obtener prescripción', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; prescriptionId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);
    const { prescriptionId } = params;
    const body = await request.json();

    const {
      consultation_id, patient_id, client_id, professional_id,
      prescription_date, instructions, status, items,
    } = body;

    const result = await transaction(async (client) => {
      const prescResult = await client.query(
        `UPDATE veterinary_prescriptions SET
          consultation_id = $1,
          patient_id = COALESCE($2, patient_id),
          client_id = COALESCE($3, client_id),
          professional_id = COALESCE($4, professional_id),
          prescription_date = COALESCE($5, prescription_date),
          instructions = $6,
          status = COALESCE($7, status)
         WHERE id = $8 AND company_id = $9
         RETURNING *`,
        [consultation_id || null, patient_id || null, client_id || null,
         professional_id || null, prescription_date || null,
         instructions !== undefined ? instructions : null,
         status || null, prescriptionId, companyId]
      );

      if (prescResult.rows.length === 0) {
        return null;
      }

      if (items && Array.isArray(items)) {
        await client.query(
          'DELETE FROM veterinary_prescription_items WHERE prescription_id = $1',
          [prescriptionId]
        );

        for (const item of items) {
          await client.query(
            `INSERT INTO veterinary_prescription_items
              (prescription_id, company_id, medication_name, active_ingredient, presentation, dose, frequency, duration, route, quantity, special_instructions)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [prescriptionId, companyId, item.medication_name, item.active_ingredient || null,
             item.presentation || null, item.dose || null, item.frequency || null,
             item.duration || null, item.route || null, item.quantity || null,
             item.special_instructions || null]
          );
        }
      }

      return prescResult;
    });

    if (!result) {
      return errorResponse('Prescripción no encontrada', 404);
    }

    const prescription = await getPrescriptionWithItems(companyId, prescriptionId);
    return successResponse(prescription);
  } catch (error) {
    return errorResponse('Error al actualizar prescripción', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; prescriptionId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);
    const { prescriptionId } = params;

    const result = await query(
      'DELETE FROM veterinary_prescriptions WHERE id = $1 AND company_id = $2 RETURNING id',
      [prescriptionId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Prescripción no encontrada', 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Error al eliminar prescripción', 500);
  }
}
