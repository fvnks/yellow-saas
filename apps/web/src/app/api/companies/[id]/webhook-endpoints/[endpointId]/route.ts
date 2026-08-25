import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; endpointId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT * FROM webhook_endpoints WHERE id = $1 AND company_id = $2`,
      [params.endpointId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Webhook endpoint not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Get webhook endpoint error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; endpointId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, url, secret, events, is_active, retry_policy, headers } = body;

    if (url) {
      try {
        new URL(url);
      } catch {
        return errorResponse('Invalid URL format', 400);
      }
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

    if (events && Array.isArray(events)) {
      for (const event of events) {
        if (!validEvents.includes(event)) {
          return errorResponse(`Invalid event: ${event}`, 400);
        }
      }
    }

    const result = await query(
      `UPDATE webhook_endpoints SET
        name = COALESCE($1, name),
        url = COALESCE($2, url),
        secret = COALESCE($3, secret),
        events = COALESCE($4, events),
        is_active = COALESCE($5, is_active),
        retry_policy = COALESCE($6, retry_policy),
        headers = COALESCE($7, headers),
        updated_at = NOW()
       WHERE id = $8 AND company_id = $9
       RETURNING *`,
      [name, url, secret, events ? JSON.stringify(events) : null, is_active, retry_policy, headers, params.endpointId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Webhook endpoint not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Update webhook endpoint error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; endpointId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'DELETE FROM webhook_endpoints WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.endpointId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Webhook endpoint not found', 404);

    return successResponse({ message: 'Webhook endpoint deleted successfully' });
  } catch (err) {
    console.error('Delete webhook endpoint error:', err);
    return errorResponse('Internal server error', 500);
  }
}