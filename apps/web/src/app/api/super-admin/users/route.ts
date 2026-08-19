import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth'; export async function GET(request: NextRequest) { const admin = await verifySuperAdmin(request); if (!admin) return errorResponse('No autorizado', 401); try { const result = await query(` SELECT p.id, p.email, p.full_name, p.role, p.status, p.created_at, c.name as company_name, c.id as company_id FROM profiles p LEFT JOIN companies c ON c.id = p.company_id ORDER BY p.created_at DESC `); return successResponse(result.rows); } catch (err) { console.error('Users list error:', err); return errorResponse('Error al obtener usuarios', 500); }
}
