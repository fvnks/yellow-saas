import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const companyId = params.id;

    const result = await query(
      `SELECT ma.*, mc.label, mc.description, mc.price_monthly, mc.price_yearly, mc.features, mc.category
       FROM module_activations ma
       LEFT JOIN module_catalog mc ON mc.name = ma.module_name
       WHERE ma.company_id = $1
       ORDER BY ma.activated_at DESC`,
      [companyId]
    );

    return successResponse({ modules: result.rows });
  } catch (err) {
    console.error('Get modules error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500);
  }
}
