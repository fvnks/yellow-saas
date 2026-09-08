import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const searchParams = new URL(request.url).searchParams;

    const documentType = searchParams.get('document_type');
    const status = searchParams.get('status');
    const emitterRut = searchParams.get('emitter_rut');
    const emitterName = searchParams.get('emitter_name');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const minAmount = searchParams.get('min_amount');
    const maxAmount = searchParams.get('max_amount');
    const folio = searchParams.get('folio');
    const source = searchParams.get('source');

    let whereClause = 'WHERE rd.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (documentType) {
      whereClause += ` AND rd.document_type = $${paramIndex}`;
      params.push(documentType);
      paramIndex++;
    }
    if (status) {
      whereClause += ` AND rd.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (emitterRut) {
      whereClause += ` AND rd.emitter_rut ILIKE $${paramIndex}`;
      params.push(`%${emitterRut}%`);
      paramIndex++;
    }
    if (emitterName) {
      whereClause += ` AND rd.emitter_name ILIKE $${paramIndex}`;
      params.push(`%${emitterName}%`);
      paramIndex++;
    }
    if (dateFrom) {
      whereClause += ` AND rd.issue_date >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }
    if (dateTo) {
      whereClause += ` AND rd.issue_date <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }
    if (minAmount) {
      whereClause += ` AND rd.total_amount >= $${paramIndex}`;
      params.push(parseInt(minAmount));
      paramIndex++;
    }
    if (maxAmount) {
      whereClause += ` AND rd.total_amount <= $${paramIndex}`;
      params.push(parseInt(maxAmount));
      paramIndex++;
    }
    if (folio) {
      whereClause += ` AND rd.folio = $${paramIndex}`;
      params.push(parseInt(folio));
      paramIndex++;
    }
    if (source) {
      whereClause += ` AND rd.source = $${paramIndex}`;
      params.push(source);
      paramIndex++;
    }

    // Count
    const countResult = await query(
      `SELECT COUNT(*) FROM received_documents rd ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Data
    params.push(limit, offset);
    const dataResult = await query(
      `SELECT rd.*,
        (SELECT COUNT(*) FROM received_document_items rdi WHERE rdi.document_id = rd.id) as item_count
       FROM received_documents rd
       ${whereClause}
       ORDER BY rd.issue_date DESC, rd.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, total, page, limit);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
