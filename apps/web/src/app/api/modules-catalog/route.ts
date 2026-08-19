import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server'; export async function GET(request: NextRequest) { try { const result = await query( `SELECT * FROM module_catalog WHERE is_active = true ORDER BY sort_order ASC` ); return successResponse({ modules: result.rows }); } catch (err) { console.error('Get modules catalog error:', err); return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500); }
}
