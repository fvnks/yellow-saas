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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const { id } = params;
  const body = await request.json();
  const { action } = body;

  if (!action || !['suspend', 'activate'].includes(action)) {
    return errorResponse('Acción inválida', 400);
  }

  try {
    const newStatus = action === 'suspend' ? 'suspended' : 'active';
    await query('UPDATE companies SET status = $1, updated_at = now() WHERE id = $2', [newStatus, id]);

    const clientIp = getClientIp(request);
    await query(`
      INSERT INTO access_audit_log (super_admin_id, company_id, action, details, ip_address)
      VALUES ($1, $2, 'modify', $3, $4)
    `, [admin.id, id, JSON.stringify({ action, new_status: newStatus }), clientIp]);

    return successResponse({ status: newStatus });
  } catch (err) {
    console.error('Company suspend error:', err);
    return errorResponse('Error al actualizar empresa', 500);
  }
}
