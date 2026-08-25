import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get('unread') === 'true';

    let whereClause = 'WHERE n.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (unreadOnly) {
      whereClause += ` AND n.read_at IS NULL`;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM notifications n ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT n.* FROM notifications n
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
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
    const { user_id, type, title, message, entity_type, entity_id, project_id } = body;

    if (!type || !title || !message) return errorResponse('type, title, and message are required', 400);

    const result = await query(
      `INSERT INTO notifications (company_id, user_id, type, title, message, entity_type, entity_id, project_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [companyId, user_id || null, type, title, message, entity_type || null, entity_id || null, project_id || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    if (body.action === 'mark_all_read') {
      await query(
        'UPDATE notifications SET read_at = NOW() WHERE company_id = $1 AND read_at IS NULL',
        [companyId]
      );
      return successResponse({ message: 'All notifications marked as read' });
    }

    if (body.notification_id) {
      await query(
        'UPDATE notifications SET read_at = NOW() WHERE id = $1 AND company_id = $2',
        [body.notification_id, companyId]
      );
      return successResponse({ message: 'Notification marked as read' });
    }

    return errorResponse('Invalid action', 400);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
