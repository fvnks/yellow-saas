import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      'SELECT integration_id, config FROM company_integrations WHERE company_id = $1',
      [companyId]
    );
    const configs: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      configs[row.integration_id] = row.config || {};
    }
    return successResponse(configs);
  } catch (error: any) {
    return errorResponse(error.message || 'Error fetching integrations');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { integration_id, config } = body;
    if (!integration_id) return errorResponse('integration_id is required');

    await query(
      `INSERT INTO company_integrations (company_id, integration_id, config, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (company_id, integration_id)
       DO UPDATE SET config = $3, updated_at = NOW()`,
      [companyId, integration_id, JSON.stringify(config)]
    );

    return successResponse({ message: 'Integration saved' });
  } catch (error: any) {
    return errorResponse(error.message || 'Error saving integration');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { integration_id } = body;
    if (!integration_id) return errorResponse('integration_id is required');

    await query(
      'DELETE FROM company_integrations WHERE company_id = $1 AND integration_id = $2',
      [companyId, integration_id]
    );

    return successResponse({ message: 'Integration disconnected' });
  } catch (error: any) {
    return errorResponse(error.message || 'Error deleting integration');
  }
}
