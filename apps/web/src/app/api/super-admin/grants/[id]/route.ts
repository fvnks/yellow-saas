import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return null;
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const { id } = params;

  try {
    const grant = await query('SELECT company_id FROM company_access_grants WHERE id = $1', [id]);
    if (grant.rows.length === 0) return errorResponse('Acceso no encontrado', 404);

    await query('UPDATE company_access_grants SET is_active = false, updated_at = now() WHERE id = $1', [id]);

    const clientIp = getClientIp(request);
    await query(`
      INSERT INTO access_audit_log (super_admin_id, company_id, action, details, ip_address)
      VALUES ($1, $2, 'logout', $3, $4)
    `, [admin.id, grant.rows[0].company_id, JSON.stringify({ grant_id: id, action: 'revoked' }), clientIp]);

    return successResponse({ success: true });
  } catch (err) {
    console.error('Grant revoke error:', err);
    return errorResponse('Error al revocar acceso', 500);
  }
}
