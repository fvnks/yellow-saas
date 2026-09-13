import { query, transaction } from '@/api/lib/db';
import { successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(c.name ILIKE $${paramIndex} OR c.slug ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (statusFilter) {
      conditions.push(`c.status = $${paramIndex}`);
      params.push(statusFilter);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`SELECT COUNT(*) FROM companies c ${whereClause}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    const allowedSorts: Record<string, string> = { created_at: 'c.created_at', name: 'c.name', plan: 'c.plan' };
    const sortColumn = allowedSorts[sort] || 'c.created_at';

    const result = await query(
      `SELECT c.id, c.name, c.slug, c.plan, c.status, c.created_at, c.trial_ends_at,
        (SELECT COUNT(*) FROM profiles WHERE company_id = c.id) as user_count,
        COALESCE(
          (SELECT json_agg(ma.module_name)
           FROM module_activations ma
           WHERE ma.company_id = c.id AND ma.status = 'active'),
          '[]'::json
        ) as active_modules
       FROM companies c
       ${whereClause}
       ORDER BY ${sortColumn} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (err) {
    console.error('Companies list error:', err);
    return errorResponse('Error al obtener empresas', 500);
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const body = await request.json();
    const { name, slug, plan, email, password, modules } = body;

    if (!name || !slug) return errorResponse('Nombre y slug son requeridos', 400);
    if (!email || !password) return errorResponse('Email y password son requeridos', 400);

    const existing = await query('SELECT id FROM companies WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) return errorResponse('Ya existe una empresa con ese slug', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    const createdCompany = await transaction(async (client) => {
      const companyResult = await client.query(
        `INSERT INTO companies (name, slug, plan, status, trial_ends_at)
         VALUES ($1, $2, $3, 'active', NOW() + INTERVAL '14 days')
         RETURNING *`,
        [name, slug, plan || 'professional']
      );
      const company = companyResult.rows[0];

      await client.query(
        `INSERT INTO profiles (company_id, email, full_name, password_hash, role, role_type, status)
         VALUES ($1, $2, $3, $4, 'owner', 'company', 'active')`,
        [company.id, email, name, passwordHash]
      );

      if (Array.isArray(modules) && modules.length > 0) {
        const validModules = await client.query('SELECT name FROM module_catalog WHERE name = ANY($1) AND is_active = true', [modules]);
        const validNames = new Set(validModules.rows.map((r: any) => r.name));

        for (const moduleName of modules) {
          if (!validNames.has(moduleName)) {
            console.warn(`Module '${moduleName}' not found in catalog, skipping`);
            continue;
          }
          await client.query(
            `INSERT INTO module_activations (company_id, module_name, status, activated_at)
             VALUES ($1, $2, 'active', now())
             ON CONFLICT (company_id, module_name) DO UPDATE SET status = 'active', activated_at = now()`,
            [company.id, moduleName]
          );
        }
      }

      // Create default roles for the company
      const defaultRoles = [
        { name: 'owner', description: 'Propietario de la empresa' },
        { name: 'admin', description: 'Administrador' },
        { name: 'member', description: 'Miembro' },
        { name: 'viewer', description: 'Solo lectura' },
      ];
      const createdRoles: Record<string, string> = {};
      for (const role of defaultRoles) {
        const { rows } = await client.query(
          `INSERT INTO roles (company_id, name, description, is_system)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (company_id, name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id, name`,
          [company.id, role.name, role.description]
        );
        if (rows[0]) createdRoles[rows[0].name] = rows[0].id;
      }

      // Assign owner role to the creating user
      const ownerProfile = await client.query(
        `SELECT id FROM profiles WHERE company_id = $1 AND role = 'owner' LIMIT 1`,
        [company.id]
      );
      if (ownerProfile.rows[0] && createdRoles['owner']) {
        await client.query(
          `INSERT INTO user_roles (user_id, role_id, company_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, role_id, company_id) DO NOTHING`,
          [ownerProfile.rows[0].id, createdRoles['owner'], company.id]
        );
      }

      return company;
    });

    return successResponse({ company: createdCompany, modules: modules || [] }, 201);
  } catch (err) {
    console.error('Create company error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Error al crear empresa', 500);
  }
}
