import { query } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; roleId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { permission_ids } = body;

    if (!Array.isArray(permission_ids)) return errorResponse('permission_ids must be an array', 400);

    // Verify role belongs to this company (cross-tenant check)
    const { rows: role } = await query(
      `SELECT id FROM roles WHERE id = $1 AND company_id = $2`,
      [params.roleId, companyId]
    );
    if (!role[0]) return errorResponse('Role not found', 404);

    // Validate all permission_ids exist in the catalog
    if (permission_ids.length > 0) {
      const { rows: validPerms } = await query(
        `SELECT id FROM permissions WHERE id = ANY($1)`,
        [permission_ids]
      );
      const validIds = new Set(validPerms.map((p: any) => p.id));
      const invalid = permission_ids.filter((id: string) => !validIds.has(id));
      if (invalid.length > 0) {
        return errorResponse(`Invalid permission IDs: ${invalid.join(', ')}`, 400);
      }
    }

    // Delete existing permissions
    await query(`DELETE FROM role_permissions WHERE role_id = $1`, [params.roleId]);

    // Insert new permissions
    if (permission_ids.length > 0) {
      for (const pid of permission_ids) {
        await query(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`,
          [params.roleId, pid]
        );
      }
    }

    return successResponse({ updated: true });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
