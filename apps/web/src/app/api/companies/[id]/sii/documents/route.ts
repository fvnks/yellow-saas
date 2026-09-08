import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    let whereClause = 'WHERE i.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND i.sii_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND i.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM invoices i ${whereClause}`,
      params
    );

    const dataResult = await query(`
      SELECT 
        i.id,
        i.type,
        i.folio,
        i.fecha_emision,
        i.monto_total,
        i.sii_status,
        i.sii_track_id,
        i.sii_sent_at,
        i.sii_error,
        c.name as buyer_name,
        c.tax_id as buyer_rut
      FROM invoices i
      LEFT JOIN customers c ON i.buyer_id = c.id
      ${whereClause}
      ORDER BY i.fecha_emision DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

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
    const { document_ids, action } = body;

    if (!document_ids || !Array.isArray(document_ids)) {
      return errorResponse('document_ids array is required', 400);
    }

    if (action === 'send_all_pending') {
      const result = await query(
        `UPDATE invoices 
         SET sii_status = 'pending', sii_sent_at = NOW()
         WHERE id = ANY($1::uuid[]) AND company_id = $2 AND sii_status = 'pending'
         RETURNING id, folio, type`,
        [document_ids, companyId]
      );
      return successResponse({ sent: result.rows.length, documents: result.rows });
    }

    if (action === 'sync_status') {
      const results = await Promise.all(
        document_ids.map(async (id: string) => {
          const check = await query(
            `SELECT id, folio, type, sii_status FROM invoices WHERE id = $1 AND company_id = $2`,
            [id, companyId]
          );
          return check.rows[0];
        })
      );
      return successResponse(results.filter(Boolean));
    }

    return errorResponse('Invalid action', 400);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
