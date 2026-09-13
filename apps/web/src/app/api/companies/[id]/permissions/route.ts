import { query } from '@/api/lib/db';
import { getCompanyId, paginatedResponse, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';

const JWT_SECRET = getJwtSecret();

// GET: List all permission modules/actions (catalog) OR user-specific permissions
export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const mine = url.searchParams.get('mine');

    // If ?mine=true, return the current user's effective permissions
    if (mine === 'true') {
      const token = request.headers.get('Authorization')?.startsWith('Bearer ')
        ? request.headers.get('Authorization')!.substring(7)
        : request.cookies.get('auth-token')?.value;

      if (!token) return errorResponse('No auth token', 401);

      let currentUserId: string;
      let currentUserRole: string;
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        currentUserId = payload.id as string;
        currentUserRole = (payload.role as string) || 'member';
      } catch {
        return errorResponse('Invalid token', 401);
      }

      // Owner/admin sees everything
      if (currentUserRole === 'owner' || currentUserRole === 'admin') {
        const { rows } = await query(
          `SELECT * FROM permissions ORDER BY module, action`
        );
        return successResponse({ permissions: rows, role: currentUserRole, isFull: true });
      }

      // Get user's roles → role_permissions → permissions
      const { rows } = await query(
        `SELECT DISTINCT p.id, p.module, p.action, p.description
         FROM user_roles ur
         JOIN role_permissions rp ON rp.role_id = ur.role_id
         JOIN permissions p ON p.id = rp.permission_id
         WHERE ur.user_id = $1 AND ur.company_id = $2
         ORDER BY p.module, p.action`,
        [currentUserId, companyId]
      );

      return successResponse({ permissions: rows, role: currentUserRole, isFull: false });
    }

    // If specific user_id requested, return their permissions
    if (userId) {
      const { rows } = await query(
        `SELECT DISTINCT p.id, p.module, p.action, p.description
         FROM user_roles ur
         JOIN role_permissions rp ON rp.role_id = ur.role_id
         JOIN permissions p ON p.id = rp.permission_id
         WHERE ur.user_id = $1 AND ur.company_id = $2
         ORDER BY p.module, p.action`,
        [userId, companyId]
      );
      return successResponse(rows);
    }

    // Default: return full catalog (for admin/role management UI)
    const { rows } = await query(
      `SELECT * FROM permissions ORDER BY module, action`
    );

    return paginatedResponse(rows || [], rows.length, 1, 200);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
