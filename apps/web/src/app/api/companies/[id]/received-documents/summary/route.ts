import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const searchParams = new URL(request.url).searchParams;
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    let dateFilter = '';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (dateFrom) {
      dateFilter += ` AND issue_date >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }
    if (dateTo) {
      dateFilter += ` AND issue_date <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }

    // Overall summary
    const [summaryResult, byTypeResult, byStatusResult, byEmitterResult, recentResult] = await Promise.all([
      query(
        `SELECT
          COUNT(*) as total_documents,
          COALESCE(SUM(total_amount), 0) as total_amount,
          COALESCE(SUM(net_amount), 0) as total_net,
          COALESCE(SUM(vat_amount), 0) as total_vat,
          COALESCE(SUM(exempt_amount), 0) as total_exempt,
          COALESCE(AVG(total_amount), 0) as avg_amount,
          MIN(issue_date) as earliest_date,
          MAX(issue_date) as latest_date
         FROM received_documents
         WHERE company_id = $1 ${dateFilter}`,
        params
      ),
      query(
        `SELECT
          document_type,
          COUNT(*) as count,
          COALESCE(SUM(total_amount), 0) as total_amount
         FROM received_documents
         WHERE company_id = $1 ${dateFilter}
         GROUP BY document_type
         ORDER BY count DESC`,
        params
      ),
      query(
        `SELECT
          status,
          COUNT(*) as count
         FROM received_documents
         WHERE company_id = $1 ${dateFilter}
         GROUP BY status
         ORDER BY count DESC`,
        params
      ),
      query(
        `SELECT
          emitter_rut,
          emitter_name,
          COUNT(*) as document_count,
          COALESCE(SUM(total_amount), 0) as total_amount
         FROM received_documents
         WHERE company_id = $1 ${dateFilter}
         GROUP BY emitter_rut, emitter_name
         ORDER BY total_amount DESC
         LIMIT 10`,
        params
      ),
      query(
        `SELECT id, document_type, folio, emitter_name, emitter_rut,
          total_amount, status, issue_date, created_at
         FROM received_documents
         WHERE company_id = $1 ${dateFilter}
         ORDER BY created_at DESC
         LIMIT 5`,
        params
      ),
    ]);

    return successResponse({
      summary: summaryResult.rows[0],
      by_type: byTypeResult.rows,
      by_status: byStatusResult.rows,
      top_emitters: byEmitterResult.rows,
      recent: recentResult.rows,
    });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
