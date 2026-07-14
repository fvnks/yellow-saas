import { query } from '../../../../../../lib/db';
import { getCompanyId, successResponse, errorResponse } from '../../../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { ids } = body;

    let whereClause = 'WHERE poq.company_id = $1 AND poq.status IN (\'pending\', \'failed\')';
    const params: any[] = [companyId];

    if (ids && Array.isArray(ids) && ids.length > 0) {
      const placeholders = ids.map((_, i) => `$${i + 2}`).join(',');
      whereClause += ` AND poq.id IN (${placeholders})`;
      params.push(...ids);
    }

    const pendingItems = await query(
      `SELECT * FROM pwa_offline_queue ${whereClause} ORDER BY created_at ASC LIMIT 100`,
      params
    );

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of pendingItems.rows) {
      try {
        await processOfflineAction(companyId, item);
        
        await query(
          `UPDATE pwa_offline_queue SET status = 'synced', synced_at = NOW(), retry_count = retry_count + 1 WHERE id = $1`,
          [item.id]
        );
        synced++;
      } catch (err: any) {
        failed++;
        const errorMsg = `Action ${item.id} (${item.action_type}): ${err.message}`;
        errors.push(errorMsg);
        
        await query(
          `UPDATE pwa_offline_queue SET 
            status = CASE WHEN retry_count >= 3 THEN 'failed' ELSE 'pending' END,
            retry_count = retry_count + 1,
            last_error = $1,
            next_retry_at = NOW() + INTERVAL '5 minutes'
           WHERE id = $2`,
          [err.message, item.id]
        );
      }
    }

    return successResponse({
      total: pendingItems.rows.length,
      synced,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('Sync offline queue error:', err);
    return errorResponse('Internal server error', 500);
  }
}

async function processOfflineAction(companyId: string, action: any) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  const response = await fetch(`${apiUrl}/api/companies/${companyId}/sync-offline-action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-API': 'true',
    },
    body: JSON.stringify({
      action_type: action.action_type,
      entity_type: action.entity_type,
      entity_id: action.entity_id,
      payload: action.payload,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }
}