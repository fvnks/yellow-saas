import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT vlo.*,
        (SELECT json_build_object('id', vp.id, 'name', vp.name, 'species', vp.species)) as patient,
        (SELECT json_build_object('id', vc.id, 'full_name', vc.full_name)) as client,
        (SELECT json_build_object('id', vepr.id, 'full_name', vepr.full_name)) as professional,
        (SELECT json_build_object('id', vlp.id, 'name', vlp.name, 'code', vlp.code)) as panel,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', vlr.id, 'test_id', vlr.test_id, 'test_name', vlr.test_name, 'value', vlr.value,
            'unit', vlr.unit, 'reference_range', vlr.reference_range, 'flag', vlr.flag, 'note', vlr.note
          )) FROM veterinary_lab_results vlr WHERE vlr.order_id = vlo.id), '[]'
        ) as results
       FROM veterinary_lab_orders vlo
       LEFT JOIN veterinary_patients vp ON vp.id = vlo.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vlo.client_id
       LEFT JOIN veterinary_professionals vepr ON vepr.id = vlo.professional_id
       LEFT JOIN veterinary_lab_panels vlp ON vlp.id = vlo.panel_id
       WHERE vlo.id = $1 AND vlo.company_id = $2`,
      [params.orderId, companyId]
    );

    if (!rows[0]) return errorResponse('Lab order not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch lab order', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const {
      patient_id, client_id, professional_id, panel_id, ordered_date,
      sampling_date, sample_type, external_lab, priority, status, notes
    } = body;

    if (sample_type) {
      const validSampleTypes = ['sangre', 'orina', 'heces', 'raspado_piel', 'frotis_sanguineo', 'aspiracion', 'otro'];
      if (!validSampleTypes.includes(sample_type)) return errorResponse('Invalid sample type', 400);
    }

    if (priority) {
      const validPriorities = ['rutina', 'urgencia', 'estatica'];
      if (!validPriorities.includes(priority)) return errorResponse('Invalid priority', 400);
    }

    if (status) {
      const validStatuses = ['ordenada', 'muestra_tomada', 'en_proceso', 'resultados_listos', 'entregado', 'cancelada'];
      if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400);
    }

    const { rows } = await query(
      `UPDATE veterinary_lab_orders SET
        patient_id = COALESCE($1, patient_id), client_id = COALESCE($2, client_id),
        professional_id = $3, panel_id = COALESCE($4, panel_id),
        ordered_date = COALESCE($5, ordered_date), sampling_date = $6,
        sample_type = COALESCE($7, sample_type), external_lab = $8,
        priority = COALESCE($9, priority), status = COALESCE($10, status),
        notes = $11, updated_at = NOW()
       WHERE id = $12 AND company_id = $13
       RETURNING *`,
      [patient_id || null, client_id || null, professional_id || null,
       panel_id || null, ordered_date || null, sampling_date !== undefined ? sampling_date : null,
       sample_type || null, external_lab !== undefined ? external_lab : null,
       priority || null, status || null, notes !== undefined ? notes : null,
       params.orderId, companyId]
    );

    if (!rows[0]) return errorResponse('Lab order not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update lab order', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: existing } = await query(
      `SELECT id, status FROM veterinary_lab_orders WHERE id = $1 AND company_id = $2`,
      [params.orderId, companyId]
    );

    if (!existing[0]) return errorResponse('Lab order not found', 404);

    const nonDeletable = ['entregado'];
    if (nonDeletable.includes(existing[0].status)) {
      return errorResponse('Cannot delete a delivered lab order', 400);
    }

    await query(
      `DELETE FROM veterinary_lab_results WHERE order_id = $1 AND company_id = $2`,
      [params.orderId, companyId]
    );
    await query(
      `DELETE FROM veterinary_lab_orders WHERE id = $1 AND company_id = $2`,
      [params.orderId, companyId]
    );

    return successResponse({ message: 'Lab order deleted successfully' });
  } catch {
    return errorResponse('Failed to delete lab order', 500);
  }
}
