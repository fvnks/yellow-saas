import { query } from '@/api/lib/db';
import { successResponse, errorResponse, getCompanyId } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'yellow-erp-secret-key-change-in-production');

async function getUserFromRequest(request: NextRequest): Promise<{ id: string; company_id: string; role: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.company_id) return null;
    return { id: payload.id as string, company_id: payload.company_id as string, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('No autorizado', 401);
  if (user.company_id !== params.id) return errorResponse('Acceso denegado', 403);

  try {
    const result = await query(`
      SELECT 
        g.id, g.access_level, g.reason, g.is_active, g.expires_at, g.created_at,
        sa.name as super_admin_name, sa.email as super_admin_email,
        p.full_name as granted_by_name
      FROM company_access_grants g
      JOIN super_admins sa ON sa.id = g.super_admin_id
      LEFT JOIN profiles p ON p.id = g.granted_by
      WHERE g.company_id = $1
      ORDER BY g.created_at DESC
    `, [params.id]);

    return successResponse(result.rows);
  } catch (err) {
    console.error('Company grants list error:', err);
    return errorResponse('Error al obtener accesos', 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('No autorizado', 401);
  if (user.company_id !== params.id) return errorResponse('Acceso denegado', 403);
  if (!['owner', 'admin'].includes(user.role)) return errorResponse('Solo owner o admin pueden gestionar accesos', 403);

  const body = await request.json();
  const { super_admin_email, access_level, reason, expires_at } = body;

  if (!super_admin_email) return errorResponse('Email del super admin es requerido', 400);

  try {
    // Find super admin by email
    const adminResult = await query(
      'SELECT id, name, email FROM super_admins WHERE email = $1 AND is_active = true',
      [super_admin_email]
    );

    if (adminResult.rows.length === 0) {
      return errorResponse('Super admin no encontrado', 404);
    }

    const superAdmin = adminResult.rows[0];

    // Check if grant already exists
    const existing = await query(
      'SELECT id, is_active FROM company_access_grants WHERE company_id = $1 AND super_admin_id = $2',
      [params.id, superAdmin.id]
    );

    if (existing.rows.length > 0) {
      // Update existing grant
      await query(`
        UPDATE company_access_grants 
        SET is_active = true, access_level = $1, reason = $2, expires_at = $3, updated_at = now()
        WHERE id = $4
      `, [access_level || 'read', reason, expires_at, existing.rows[0].id]);
    } else {
      // Create new grant
      await query(`
        INSERT INTO company_access_grants (company_id, super_admin_id, granted_by, access_level, reason, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [params.id, superAdmin.id, user.id, access_level || 'read', reason, expires_at]);
    }

    // Log the action
    await query(`
      INSERT INTO access_audit_log (super_admin_id, company_id, action, details)
      VALUES ($1, $2, 'access', $3)
    `, [superAdmin.id, params.id, JSON.stringify({ granted_by: user.id, access_level, reason })]);

    return successResponse({ success: true, super_admin: { name: superAdmin.name, email: superAdmin.email } });
  } catch (err) {
    console.error('Company grant create error:', err);
    return errorResponse('Error al crear acceso', 500);
  }
}
