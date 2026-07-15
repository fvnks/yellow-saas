import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

const allowedStatus = ['pagada', 'no_pagada'];
const allowedAreas = ['LOGISTICA', 'VERTIKAL', 'CASA', 'BRONCES'];
const allowedPaymentTypes = ['tarjeta_credito', 'tarjeta_debito', 'transferencia', 'efectivo', 'cheque', 'otro'];

export async function GET(request: NextRequest, { params }: { params: { id: string; registerId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT * FROM purchase_registers WHERE company_id = $1 AND id = $2`,
      [companyId, params.registerId]
    );

    if (result.rows.length === 0) return errorResponse('Record not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; registerId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { razon_social, rut, invoice_number, emission_date, status, amount, area, payment_type, payment_date, notes } = body;

    if (status && !allowedStatus.includes(status)) return errorResponse('Invalid status', 400);
    if (area && !allowedAreas.includes(area)) return errorResponse('Invalid area', 400);
    if (payment_type && !allowedPaymentTypes.includes(payment_type)) return errorResponse('Invalid payment type', 400);

    const result = await query(
      `UPDATE purchase_registers SET
        razon_social = COALESCE($1, razon_social),
        rut = $2,
        invoice_number = COALESCE($3, invoice_number),
        emission_date = COALESCE($4, emission_date),
        status = COALESCE($5, status),
        amount = COALESCE($6, amount),
        area = COALESCE($7, area),
        payment_type = COALESCE($8, payment_type),
        payment_date = $9,
        notes = $10,
        updated_at = now()
       WHERE company_id = $11 AND id = $12
       RETURNING *`,
      [razon_social, rut, invoice_number, emission_date, status, amount, area, payment_type, payment_date, notes, companyId, params.registerId]
    );

    if (result.rows.length === 0) return errorResponse('Record not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; registerId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `DELETE FROM purchase_registers WHERE company_id = $1 AND id = $2 RETURNING id`,
      [companyId, params.registerId]
    );

    if (result.rows.length === 0) return errorResponse('Record not found', 404);
    return successResponse({ message: 'Record deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
