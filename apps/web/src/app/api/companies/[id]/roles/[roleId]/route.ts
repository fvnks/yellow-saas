import { query } from '@/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
} from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; roleId: string } }
) {
  try {
    const companyId = params.id;
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: roleRows } = await query(
      `SELECT * FROM roles WHERE id = $1 AND company_id = $2`,
      [params.roleId, companyId]
    );

    if (!roleRows[0]) return errorResponse('Role not found', 404);

    const { rows: rolePerms } = await query(
      `SELECT json_build_object('id', p.id, 'module', p.module, 'action', p.action, 'description', p.description) as permission
       FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [params.roleId]
    );

    const permissions = rolePerms.map((rp: any) => rp.permission);

    return successResponse({ ...roleRows[0], permissions });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; roleId: string } }
) {
  try {
    const companyId = params.id;
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description } = body;

    try {
      const { rows } = await query(
        `UPDATE roles SET name = $1, description = $2, updated_at = NOW()
         WHERE id = $3 AND company_id = $4
         RETURNING *`,
        [name, description, params.roleId, companyId]
      );

      if (!rows[0]) return errorResponse('Role not found', 404);

      return successResponse(rows[0]);
    } catch (error: any) {
      if (error.code === '23505') return errorResponse('Ya existe un rol con ese nombre', 400);
      return errorResponse(error.message, 500);
    }
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; roleId: string } }
) {
  try {
    const companyId = params.id;
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: role } = await query(
      `SELECT is_system FROM roles WHERE id = $1 AND company_id = $2`,
      [params.roleId, companyId]
    );

    if (!role[0]) return errorResponse('Role not found', 404);
    if (role[0].is_system) return errorResponse('No se puede eliminar un rol del sistema', 400);

    const { rows: userRoles } = await query(
      `SELECT COUNT(*) as count FROM user_roles WHERE role_id = $1`,
      [params.roleId]
    );

    if (parseInt(userRoles[0]?.count || '0') > 0) {
      return errorResponse('No se puede eliminar un rol asignado a usuarios', 400);
    }

    await query(`DELETE FROM role_permissions WHERE role_id = $1`, [params.roleId]);
    await query(`DELETE FROM roles WHERE id = $1 AND company_id = $2`, [params.roleId, companyId]);

    return successResponse({ deleted: true });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}