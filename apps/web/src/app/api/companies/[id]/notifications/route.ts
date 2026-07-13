import { query } from '../../../lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const unreadOnly = url.searchParams.get('unread') === 'true';

    let whereClause = 'WHERE company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (unreadOnly) {
      whereClause += ` AND is_read = false`;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM notifications ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
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
    const { type, title, message, severity, entity_type, entity_id } = body;

    if (!type || !title || !message) {
      return errorResponse('Type, title, and message are required', 400);
    }

    const result = await query(
      `INSERT INTO notifications (company_id, type, title, message, severity, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [companyId, type, title, message, severity || 'info', entity_type || null, entity_id || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
