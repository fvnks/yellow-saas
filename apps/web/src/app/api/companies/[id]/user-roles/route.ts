import { query } from '../../../lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  isDemoMode,
} from '../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    if (isDemoMode) {
      return successResponse([]);
    }

    const { rows } = await query(
      `SELECT ur.id, ur.user_id, ur.role_id,
        (SELECT json_build_object('id', r.id, 'name', r.name, 'description', r.description) FROM roles r WHERE r.id = ur.role_id) as role,
        (SELECT json_build_object('id', pr.id, 'email', pr.email, 'full_name', pr.full_name) FROM profiles pr WHERE pr.id = ur.user_id) as "user"
       FROM user_roles ur
       WHERE ur.company_id = $1`,
      [companyId]
    );

    return successResponse(rows || []);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { user_id, role_id } = body;

    if (!user_id || !role_id) return errorResponse('user_id and role_id are required', 400);

    if (isDemoMode) {
      return successResponse({ id: crypto.randomUUID(), user_id, role_id, company_id: companyId }, 201);
    }

    const { rows } = await query(
      `INSERT INTO user_roles (user_id, role_id, company_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, role_id, company_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING *`,
      [user_id, role_id, companyId]
    );

    return successResponse(rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { user_id, role_id } = body;

    if (!user_id || !role_id) return errorResponse('user_id and role_id are required', 400);

    if (isDemoMode) {
      return successResponse({ deleted: true });
    }

    await query(
      `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2 AND company_id = $3`,
      [user_id, role_id, companyId]
    );

    return successResponse({ deleted: true });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
