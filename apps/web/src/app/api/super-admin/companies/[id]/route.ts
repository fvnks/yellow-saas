import { query, transaction } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const { id } = params;

  try {
    const companyResult = await query('SELECT * FROM companies WHERE id = $1', [id]);
    if (companyResult.rows.length === 0) return errorResponse('Empresa no encontrada', 404);

    const usersResult = await query(
      'SELECT id, email, full_name, role, status, created_at FROM profiles WHERE company_id = $1 ORDER BY created_at',
      [id]
    );

    const grantsResult = await query(`
      SELECT 
        g.id, g.access_level, g.reason, g.is_active, g.expires_at, g.created_at,
        sa.name as super_admin_name, sa.email as super_admin_email
      FROM company_access_grants g
      JOIN super_admins sa ON sa.id = g.super_admin_id
      WHERE g.company_id = $1
      ORDER BY g.created_at DESC
    `, [id]);

    let modulesResult = { rows: [] as Record<string, unknown>[] };
    let catalogResult = { rows: [] as Record<string, unknown>[] };
    try {
      modulesResult = await query(
        `SELECT m.*, mc.name as catalog_name, mc.description as catalog_description
         FROM module_activations m
         LEFT JOIN module_catalog mc ON mc.name = m.module_name
         WHERE m.company_id = $1
         ORDER BY m.activated_at DESC`,
        [id]
      );
      catalogResult = await query('SELECT * FROM module_catalog ORDER BY name', []);
    } catch (e) {
      console.warn('Module tables not available:', (e as Error).message);
    }

    return successResponse({
      ...companyResult.rows[0],
      users: usersResult.rows,
      grants: grantsResult.rows,
      modules: modulesResult.rows,
      module_catalog: catalogResult.rows,
    });
  } catch (err) {
    console.error('Company detail error:', err);
    return errorResponse('Error al obtener empresa', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const { id } = params;
  const body = await request.json();
  const { name, slug, plan, status } = body;

  try {
    const existing = await query('SELECT id FROM companies WHERE id = $1', [id]);
    if (existing.rows.length === 0) return errorResponse('Empresa no encontrada', 404);

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name) { updates.push(`name = $${idx++}`); values.push(name); }
    if (slug) {
      const slugCheck = await query('SELECT id FROM companies WHERE slug = $1 AND id != $2', [slug, id]);
      if (slugCheck.rows.length > 0) return errorResponse('Ya existe una empresa con ese slug', 409);
      updates.push(`slug = $${idx++}`);
      values.push(slug);
    }
    if (plan) { updates.push(`plan = $${idx++}`); values.push(plan); }
    if (status) { updates.push(`status = $${idx++}`); values.push(status); }

    if (updates.length === 0) return errorResponse('Sin cambios para actualizar', 400);

    updates.push(`updated_at = now()`);
    values.push(id);

    const result = await query(
      `UPDATE companies SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Company update error:', err);
    return errorResponse('Error al actualizar empresa', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const { id } = params;

  try {
    const existing = await query('SELECT id FROM companies WHERE id = $1', [id]);
    if (existing.rows.length === 0) return errorResponse('Empresa no encontrada', 404);

    await query('DELETE FROM companies WHERE id = $1', [id]);

    return successResponse({ deleted: true, message: 'Empresa eliminada correctamente' });
  } catch (err) {
    console.error('Company delete error:', err);
    return errorResponse('Error al eliminar empresa', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const { id } = params;
  const body = await request.json();
  const { action, module_name } = body;

  if (!action || !module_name) return errorResponse('action y module_name son requeridos', 400);

  try {
    const companyResult = await query('SELECT id FROM companies WHERE id = $1', [id]);
    if (companyResult.rows.length === 0) return errorResponse('Empresa no encontrada', 404);

    const catalogResult = await query('SELECT name FROM module_catalog WHERE name = $1', [module_name]);
    if (catalogResult.rows.length === 0) return errorResponse('Módulo no encontrado en catálogo', 404);

    if (action === 'activate') {
      await query(
        `INSERT INTO module_activations (company_id, module_name, status, activated_at, activated_by)
         VALUES ($1, $2, 'active', now(), $3)
         ON CONFLICT (company_id, module_name) DO UPDATE SET status = 'active', activated_at = now()`,
        [id, module_name, admin.id]
      );
    } else if (action === 'deactivate') {
      await query(
        `UPDATE module_activations SET status = 'cancelled', cancelled_at = now()
         WHERE company_id = $1 AND module_name = $2 AND status = 'active'`,
        [id, module_name]
      );
    } else {
      return errorResponse('action debe ser activate o deactivate', 400);
    }

    return successResponse({ success: true });
  } catch (err) {
    console.error('Module toggle error:', err);
    return errorResponse('Error al actualizar módulo', 500);
  }
}
