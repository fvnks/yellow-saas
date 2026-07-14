import { query } from '@/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const userId = url.searchParams.get('user_id');
    const actionType = url.searchParams.get('action_type');

    let whereClause = 'WHERE poq.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND poq.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (userId) {
      whereClause += ` AND poq.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (actionType) {
      whereClause += ` AND poq.action_type = $${paramIndex}`;
      params.push(actionType);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM pwa_offline_queue poq ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT poq.*,
        json_build_object('id', u.id, 'email', u.email, 'full_name', u.full_name) as user
       FROM pwa_offline_queue poq
       LEFT JOIN profiles u ON poq.user_id = u.id
       ${whereClause}
       ORDER BY poq.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('PWA offline queue error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { user_id, action_type, entity_type, entity_id, payload } = body;

    if (!user_id || !action_type || !entity_type || !payload) {
      return errorResponse('user_id, action_type, entity_type, and payload are required', 400);
    }

    const validActions = [
      'create', 'update', 'delete',
      'stock_adjust', 'stock_transfer', 'stock_receive',
      'pick_start', 'pick_complete', 'pick_short',
      'count_start', 'count_item', 'count_complete',
      'receipt_start', 'receipt_item', 'receipt_complete',
      'inspection_start', 'inspection_item', 'inspection_complete',
    ];

    if (!validActions.includes(action_type)) {
      return errorResponse(`Invalid action_type: ${action_type}`, 400);
    }

    const result = await query(
      `INSERT INTO pwa_offline_queue (company_id, user_id, action_type, entity_type, entity_id, payload)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [companyId, user_id, action_type, entity_type, entity_id || null, payload]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('PWA offline queue error:', err);
    return errorResponse('Internal server error', 500);
  }
}