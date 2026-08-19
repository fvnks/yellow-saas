import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server'; export async function GET(request: NextRequest, { params }: { params: { id: string } }) { try { const companyId = params.id; const result = await query( `SELECT * FROM subscription_invoices WHERE company_id = $1 ORDER BY created_at DESC LIMIT 50`, [companyId] ); return successResponse({ invoices: result.rows }); } catch (err) { console.error('Get invoices error:', err); return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500); }
}
