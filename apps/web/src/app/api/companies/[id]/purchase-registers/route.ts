import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

const allowedStatus = ['pagada', 'no_pagada'];
const allowedAreas = ['LOGISTICA', 'VERTIKAL', 'CASA', 'BRONCES'];
const allowedPaymentTypes = ['tarjeta_credito', 'tarjeta_debito', 'transferencia', 'efectivo', 'cheque', 'otro'];
const allowedSortColumns = ['emission_date', 'amount', 'razon_social', 'invoice_number', 'status', 'area', 'payment_type', 'created_at'];

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);

    let whereClause = 'WHERE pr.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (pr.razon_social ILIKE $${paramIndex} OR pr.rut ILIKE $${paramIndex} OR pr.invoice_number ILIKE $${paramIndex} OR pr.notes ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const statusFilter = request.nextUrl.searchParams.get('status');
    if (statusFilter && allowedStatus.includes(statusFilter)) {
      whereClause += ` AND pr.status = $${paramIndex}`;
      params.push(statusFilter);
      paramIndex++;
    }

    const areaFilter = request.nextUrl.searchParams.get('area');
    if (areaFilter && allowedAreas.includes(areaFilter)) {
      whereClause += ` AND pr.area = $${paramIndex}`;
      params.push(areaFilter);
      paramIndex++;
    }

    const sortBy = allowedSortColumns.includes(sort || '') ? sort : 'emission_date';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const countResult = await query(
      `SELECT COUNT(*) FROM purchase_registers pr ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT pr.* FROM purchase_registers pr ${whereClause} ORDER BY pr.${sortBy} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { razon_social, rut, invoice_number, emission_date, status, amount, area, payment_type, payment_date, notes } = body;

    if (!razon_social) return errorResponse('Razon social is required', 400);
    if (!invoice_number) return errorResponse('Invoice number is required', 400);
    if (!area) return errorResponse('Area is required', 400);
    if (!allowedAreas.includes(area)) return errorResponse('Invalid area', 400);
    if (!payment_type) return errorResponse('Payment type is required', 400);
    if (!allowedPaymentTypes.includes(payment_type)) return errorResponse('Invalid payment type', 400);
    if (status && !allowedStatus.includes(status)) return errorResponse('Invalid status', 400);

    const existing = await query(
      `SELECT id FROM purchase_registers WHERE company_id = $1 AND invoice_number = $2`,
      [companyId, invoice_number]
    );
    if (existing.rows.length > 0) {
      return errorResponse('An invoice with this number already exists', 400);
    }

    const result = await query(
      `INSERT INTO purchase_registers (company_id, razon_social, rut, invoice_number, emission_date, status, amount, area, payment_type, payment_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [companyId, razon_social, rut || null, invoice_number, emission_date || new Date().toISOString().split('T')[0], status || 'no_pagada', amount || 0, area, payment_type, payment_date || null, notes || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
