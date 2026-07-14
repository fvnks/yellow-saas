import { query } from '../../../../../lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '../../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const isActive = url.searchParams.get('is_active');

    let whereClause = 'WHERE we.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (isActive !== null) {
      whereClause += ` AND we.is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (we.name ILIKE $${paramIndex} OR we.url ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM webhook_endpoints we ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT we.* FROM webhook_endpoints we ${whereClause} ORDER BY we.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Webhook endpoints error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, url, secret, events, is_active, retry_policy, headers } = body;

    if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
      return errorResponse('name, url, and events (array) are required', 400);
    }

    try {
      new URL(url);
    } catch {
      return errorResponse('Invalid URL format', 400);
    }

    const validEvents = [
      'stock.changed',
      'stock.low',
      'stock.out',
      'batch.expiring',
      'batch.expired',
      'transfer.created',
      'transfer.completed',
      'return.created',
      'return.completed',
      'order.created',
      'order.completed',
      'invoice.created',
      'invoice.paid',
      'purchase_order.created',
      'purchase_order.received',
      'qc.inspection.created',
      'qc.inspection.completed',
    ];

    for (const event of events) {
      if (!validEvents.includes(event)) {
        return errorResponse(`Invalid event: ${event}. Must be one of: ${validEvents.join(', ')}`, 400);
      }
    }

    const result = await query(
      `INSERT INTO webhook_endpoints (company_id, name, url, secret, events, is_active, retry_policy, headers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [companyId, name, url, secret || null, events, is_active !== false, retry_policy || null, headers || null]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Create webhook endpoint error:', err);
    return errorResponse('Internal server error', 500);
  }
}