import { query } from '../../../../../lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
} from '../../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; roleId: string } }
) {
  try {
    const companyId = params.id;
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { permission_ids } = body;

    if (!Array.isArray(permission_ids)) return errorResponse('permission_ids must be an array', 400);

    // Verify role belongs to company
    const { rows: role } = await query(
      `SELECT id FROM roles WHERE id = $1 AND company_id = $2`,
      [params.roleId, companyId]
    );

    if (!role[0]) return errorResponse('Role not found', 404);

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
  } catch {
    return errorResponse('Internal server error', 500);
  }
}