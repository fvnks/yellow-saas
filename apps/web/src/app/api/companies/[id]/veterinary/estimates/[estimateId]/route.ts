import { query, transaction } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; estimateId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT ve.*,
        (SELECT json_build_object('id', vp.id, 'name', vp.name, 'species', vp.species)) as patient,
        (SELECT json_build_object('id', vc.id, 'full_name', vc.full_name, 'rut', vc.rut)) as client,
        (SELECT json_build_object('id', vepr.id, 'full_name', vepr.full_name)) as professional,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', vei.id, 'description', vei.description, 'quantity', vei.quantity,
            'unit_price', vei.unit_price, 'subtotal', vei.subtotal, 'sort_order', vei.sort_order
          ) ORDER BY vei.sort_order) FROM veterinary_estimate_items vei WHERE vei.estimate_id = ve.id), '[]'
        ) as items
       FROM veterinary_estimates ve
       LEFT JOIN veterinary_patients vp ON vp.id = ve.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = ve.client_id
       LEFT JOIN veterinary_professionals vepr ON vepr.id = ve.professional_id
       WHERE ve.id = $1 AND ve.company_id = $2`,
      [params.estimateId, companyId]
    );

    if (!rows[0]) return errorResponse('Estimate not found', 404);

    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to fetch estimate', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; estimateId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const {
      patient_id, client_id, professional_id, issue_date, valid_until,
      currency, subtotal, iva_pct, total, status, note, items
    } = body;

    if (currency) {
      const validCurrencies = ['CLP', 'UF'];
      if (!validCurrencies.includes(currency)) return errorResponse('Invalid currency', 400);
    }

    if (status) {
      const validStatuses = ['borrador', 'pendiente_aprobacion', 'aprobado', 'rechazado', 'expirado', 'convertido'];
      if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400);
    }

    const result = await transaction(async (client) => {
      const { rows } = await client.query(
        `UPDATE veterinary_estimates SET
          patient_id = COALESCE($1, patient_id), client_id = COALESCE($2, client_id),
          professional_id = $3, issue_date = COALESCE($4, issue_date),
          valid_until = $5, currency = COALESCE($6, currency),
          subtotal = COALESCE($7, subtotal), iva_pct = COALESCE($8, iva_pct),
          total = COALESCE($9, total), status = COALESCE($10, status),
          note = $11, updated_at = NOW()
         WHERE id = $12 AND company_id = $13
         RETURNING *`,
        [patient_id || null, client_id || null, professional_id || null,
         issue_date || null, valid_until || null, currency || null,
         subtotal || null, iva_pct || null, total || null,
         status || null, note !== undefined ? note : null,
         params.estimateId, companyId]
      );

      if (!rows[0]) throw new Error('NOT_FOUND');

      if (items?.length) {
        await client.query(
          `DELETE FROM veterinary_estimate_items WHERE estimate_id = $1 AND company_id = $2`,
          [params.estimateId, companyId]
        );

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemSubtotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
          await client.query(
            `INSERT INTO veterinary_estimate_items (company_id, estimate_id, description, quantity, unit_price, subtotal, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [companyId, params.estimateId, item.description, item.quantity || 0, item.unit_price || 0, itemSubtotal, item.sort_order || i]
          );
        }
      }

      return rows[0];
    });

    return successResponse(result);
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') return errorResponse('Estimate not found', 404);
    return errorResponse('Failed to update estimate', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; estimateId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: existing } = await query(
      `SELECT id, status FROM veterinary_estimates WHERE id = $1 AND company_id = $2`,
      [params.estimateId, companyId]
    );

    if (!existing[0]) return errorResponse('Estimate not found', 404);

    if (existing[0].status === 'convertido') {
      return errorResponse('Cannot delete a converted estimate', 400);
    }

    await query(
      `DELETE FROM veterinary_estimate_items WHERE estimate_id = $1 AND company_id = $2`,
      [params.estimateId, companyId]
    );
    await query(
      `DELETE FROM veterinary_estimates WHERE id = $1 AND company_id = $2`,
      [params.estimateId, companyId]
    );

    return successResponse({ message: 'Estimate deleted successfully' });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to delete estimate', 500);
  }
}
