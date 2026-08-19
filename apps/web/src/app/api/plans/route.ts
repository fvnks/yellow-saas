import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server'; export async function GET(_request: NextRequest) { try { const result = await query( "SELECT name, label, max_users, price_monthly, price_yearly, features FROM platform_plans WHERE is_active = true ORDER BY sort_order ASC" ); return successResponse(result.rows); } catch (err) { console.error('Plans fetch error:', err); return errorResponse('Error al obtener planes', 500); }
}
