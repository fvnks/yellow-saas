import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; paymentId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT vp.*,
        (SELECT json_build_object('id', vpt.id, 'name', vpt.name)) as patient,
        (SELECT json_build_object('id', vc.id, 'full_name', vc.full_name)) as client
       FROM veterinary_payments vp
       LEFT JOIN veterinary_patients vpt ON vpt.id = vp.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vp.client_id
       WHERE vp.id = $1 AND vp.company_id = $2`,
      [params.paymentId, companyId]
    );

    if (!rows[0]) return errorResponse('Payment not found', 404);

    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to fetch payment', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; paymentId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { estimate_id, patient_id, client_id, paid_at, amount, method, concept, reference_number, status } = body;

    if (method) {
      const validMethods = ['efectivo', 'debito', 'credito_webpay', 'transbank_credito', 'transferencia', 'cheque', 'mercadopago'];
      if (!validMethods.includes(method)) return errorResponse('Invalid payment method', 400);
    }

    if (status) {
      const validStatuses = ['completado', 'pendiente', 'reverso'];
      if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400);
    }

    if (amount !== undefined && Number(amount) <= 0) {
      return errorResponse('Amount must be greater than 0', 400);
    }

    const { rows } = await query(
      `UPDATE veterinary_payments SET
        estimate_id = $1, patient_id = COALESCE($2, patient_id), client_id = COALESCE($3, client_id),
        paid_at = COALESCE($4, paid_at), amount = COALESCE($5, amount),
        method = COALESCE($6, method), concept = $7, reference_number = $8,
        status = COALESCE($9, status), updated_at = NOW()
       WHERE id = $10 AND company_id = $11
       RETURNING *`,
      [estimate_id !== undefined ? estimate_id : null, patient_id || null, client_id || null,
       paid_at || null, amount || null, method || null, concept !== undefined ? concept : null,
       reference_number !== undefined ? reference_number : null, status || null,
       params.paymentId, companyId]
    );

    if (!rows[0]) return errorResponse('Payment not found', 404);

    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to update payment', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; paymentId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: existing } = await query(
      `SELECT id, status FROM veterinary_payments WHERE id = $1 AND company_id = $2`,
      [params.paymentId, companyId]
    );

    if (!existing[0]) return errorResponse('Payment not found', 404);

    if (existing[0].status === 'completado') {
      return errorResponse('Cannot delete a completed payment. Use reversal instead.', 400);
    }

    await query(
      `DELETE FROM veterinary_payments WHERE id = $1 AND company_id = $2`,
      [params.paymentId, companyId]
    );

    return successResponse({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to delete payment', 500);
  }
}
