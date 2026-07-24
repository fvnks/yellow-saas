import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const companiesResult = await query(`
      SELECT 
        c.id, c.name, c.slug, c.plan, c.status, c.created_at, c.trial_ends_at,
        (SELECT COUNT(*) FROM profiles WHERE company_id = c.id) as user_count
      FROM companies c
      ORDER BY c.created_at DESC
    `);

    const plans = [
      { name: 'free', label: 'Free', max_users: 2, price_monthly: 0 },
      { name: 'starter', label: 'Starter', max_users: 5, price_monthly: 19990 },
      { name: 'professional', label: 'Professional', max_users: 15, price_monthly: 49990 },
      { name: 'enterprise', label: 'Enterprise', max_users: -1, price_monthly: 99990 },
    ];

    return successResponse({
      companies: companiesResult.rows,
      plans,
    });
  } catch (err) {
    console.error('Billing error:', err);
    return errorResponse('Error al obtener datos de billing', 500);
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const body = await request.json();
  const { company_id, plan, status, trial_ends_at } = body;

  if (!company_id) return errorResponse('company_id es requerido', 400);

  try {
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (plan) {
      updates.push(`plan = $${idx++}`);
      values.push(plan);
    }
    if (status) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (trial_ends_at !== undefined) {
      updates.push(`trial_ends_at = $${idx++}`);
      values.push(trial_ends_at);
    }
    updates.push(`updated_at = now()`);
    values.push(company_id);

    await query(`UPDATE companies SET ${updates.join(', ')} WHERE id = $${idx}`, values);

    await query(
      "INSERT INTO access_audit_log (super_admin_id, company_id, action, details) VALUES ($1, $2, 'modify', $3)",
      [admin.id, company_id, JSON.stringify({ action: 'update_plan', plan, status })]
    );

    return successResponse({ success: true });
  } catch (err) {
    console.error('Billing update error:', err);
    return errorResponse('Error al actualizar plan', 500);
  }
}
