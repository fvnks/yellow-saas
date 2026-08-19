import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server'; export async function POST( req: NextRequest, { params }: { params: { id: string; projectId: string } }
) { try { const companyId = await getCompanyId(req); if (!companyId) return errorResponse('Company ID not found', 400); const body = await req.json(); const { archived } = body; const { rows } = await query( `UPDATE projects SET archived = $1, archived_at = CASE WHEN $1 = TRUE THEN NOW() ELSE NULL END, archived_by = CASE WHEN $1 = TRUE THEN (SELECT id FROM users WHERE company_id = $2 LIMIT 1) ELSE NULL END WHERE id = $3 AND company_id = $2 RETURNING id, name, archived, archived_at`, [archived, companyId, params.projectId] ); if (rows.length === 0) return errorResponse('Project not found', 404); return successResponse(rows[0]); } catch (e: any) { return errorResponse(e.message, 500); }
}
