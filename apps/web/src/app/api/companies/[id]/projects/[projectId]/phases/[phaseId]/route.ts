import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server'; export async function DELETE( request: NextRequest, { params }: { params: { id: string; projectId: string; phaseId: string } }
) { try { const companyId = await getCompanyId(request); if (!companyId) return errorResponse('Company ID not found', 400); const result = await query( 'DELETE FROM project_phases WHERE id = $1 AND project_id = $2 AND company_id = $3 RETURNING id', [params.phaseId, params.projectId, companyId] ); if (result.rows.length === 0) return errorResponse('Phase not found', 404); return successResponse({ message: 'Phase deleted' }); } catch { return errorResponse('Internal server error', 500); }
}
