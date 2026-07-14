import { query } from './db';
import crypto from 'crypto';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  company_id: string;
  data: any;
}

export interface RetryPolicy {
  max_retries?: number;
  base_delay_ms?: number;
  max_delay_ms?: number;
  backoff_multiplier?: number;
}

export interface WebhookEndpoint {
  id: string;
  company_id: string;
  url: string;
  events: string[];
  secret: string | null;
  headers: Record<string, string> | null;
  retry_policy: RetryPolicy | null;
  is_active: boolean;
}

export async function sendWebhook(event: string, companyId: string, data: any): Promise<void> {
  const endpoints = await query(
    `SELECT * FROM webhook_endpoints WHERE company_id = $1 AND is_active = true AND $2 = ANY(events)`,
    [companyId, event]
  );

  if (endpoints.rows.length === 0) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    company_id: companyId,
    data,
  };

  for (const endpoint of endpoints.rows) {
    await queueWebhookDelivery(endpoint, payload);
  }
}

async function queueWebhookDelivery(endpoint: WebhookEndpoint, payload: WebhookPayload): Promise<void> {
  await query(
    `INSERT INTO webhook_deliveries (company_id, endpoint_id, event, payload, status, attempt)
     VALUES ($1, $2, $3, 'pending', 0)`,
    [endpoint.company_id, endpoint.id, endpoint.events[0], JSON.stringify(payload)]
  );
}

export async function processWebhookDeliveries(): Promise<void> {
  const pendingDeliveries = await query(
    `SELECT wd.*, we.url, we.secret, we.headers, we.retry_policy
     FROM webhook_deliveries wd
     JOIN webhook_endpoints we ON wd.endpoint_id = we.id
     WHERE wd.status IN ('pending', 'retrying')
     AND wd.attempt < COALESCE(we.retry_policy->>'max_retries', '3')::int
     AND (wd.next_retry_at IS NULL OR wd.next_retry_at <= NOW())
     ORDER BY wd.created_at ASC
     LIMIT 50`
  );

  for (const delivery of pendingDeliveries.rows) {
    await processDelivery(delivery);
  }
}

async function processDelivery(delivery: any): Promise<void> {
  const { id, endpoint_id, url, secret, headers, payload, attempt, retry_policy } = delivery;

  const retryPolicy: RetryPolicy = {
    max_retries: parseInt(retry_policy?.max_retries || '3'),
    base_delay_ms: parseInt(retry_policy?.base_delay_ms || '1000'),
    max_delay_ms: parseInt(retry_policy?.max_delay_ms || '60000'),
    backoff_multiplier: parseFloat(retry_policy?.backoff_multiplier || '2'),
  };

  await query(
    `UPDATE webhook_deliveries SET status = 'processing', attempt = $1, last_attempt_at = NOW() WHERE id = $2`,
    [attempt + 1, id]
  );

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Yellow-ERP-Webhook/1.0',
    ...(headers || {}),
  };

  if (secret) {
    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    requestHeaders['X-Webhook-Signature'] = `sha256=${signature}`;
  }

  requestHeaders['X-Webhook-Event'] = delivery.event;
  requestHeaders['X-Webhook-Delivery'] = id;
  requestHeaders['X-Webhook-Timestamp'] = delivery.timestamp;

  let response: Response;
  let responseBody: string;
  let statusCode: number;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });
    statusCode = response.status;
    responseBody = await response.text();
  } catch (err) {
    statusCode = 0;
    responseBody = err instanceof Error ? err.message : String(err);
  }

  const isSuccess = statusCode >= 200 && statusCode < 300;

  if (isSuccess) {
    await query(
      `UPDATE webhook_deliveries SET status = 'success', response_status = $1, response_body = $2, completed_at = NOW() WHERE id = $3`,
      [statusCode, responseBody, id]
    );
  } else {
    const nextAttempt = attempt + 1;
    const isLastAttempt = nextAttempt >= retryPolicy.max_retries;

    if (isLastAttempt) {
      await query(
        `UPDATE webhook_deliveries SET status = 'failed', response_status = $1, response_body = $2, error_message = $3, completed_at = NOW() WHERE id = $4`,
        [statusCode, responseBody, `Failed after ${retryPolicy.max_retries} attempts`, id]
      );
    } else {
      const delay = Math.min(
        retryPolicy.base_delay_ms * Math.pow(retryPolicy.backoff_multiplier, attempt),
        retryPolicy.max_delay_ms
      );
      const nextRetryAt = new Date(Date.now() + delay);

      await query(
        `UPDATE webhook_deliveries SET status = 'retrying', attempt = $1, next_retry_at = $2, last_error = $3 WHERE id = $4`,
        [nextAttempt, nextRetryAt, `HTTP ${statusCode}: ${responseBody}`, id]
      );
    }
  }
}

export async function testWebhook(endpointId: string, companyId: string): Promise<{ success: boolean; message: string }> {
  const result = await query(
    `SELECT * FROM webhook_endpoints WHERE id = $1 AND company_id = $2`,
    [endpointId, companyId]
  );

  if (result.rows.length === 0) {
    return { success: false, message: 'Endpoint not found' };
  }

  const endpoint = result.rows[0];
  const testPayload = {
    event: 'test',
    timestamp: new Date().toISOString(),
    company_id: companyId,
    data: { message: 'This is a test webhook from Yellow ERP' },
  };

  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Yellow-ERP-Webhook/1.0',
        'X-Webhook-Event': 'test',
        'X-Webhook-Delivery': 'test-delivery',
        'X-Webhook-Timestamp': new Date().toISOString(),
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(10000),
    });

    return { success: response.ok, message: response.ok ? 'Test webhook sent successfully' : `Failed with status ${response.status}` };
  } catch (err) {
    return { success: false, message: `Test failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}