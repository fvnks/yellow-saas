import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'yellow-erp-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const result = await query(
      'SELECT id, email, full_name, company_id, role, password_hash FROM profiles WHERE email = $1 AND status = $2',
      [email, 'active']
    );

    if (result.rows.length === 0) {
      return errorResponse('Usuario no encontrado', 401);
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return errorResponse('Usuario sin contraseña', 401);
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return errorResponse('Contraseña incorrecta', 401);
    }

    // Fetch user's companies from user_companies table (with fallback)
    let companies: any[] = [];
    try {
      const companiesResult = await query(
        `SELECT uc.company_id, uc.role AS company_role, uc.is_default,
                c.name, c.slug, c.logo_url, c.plan, c.status
         FROM user_companies uc
         JOIN companies c ON c.id = uc.company_id
         WHERE uc.user_id = $1
         ORDER BY uc.is_default DESC, c.name ASC`,
        [user.id]
      );
      companies = companiesResult.rows;
    } catch {
      // user_companies table doesn't exist yet, fallback to profiles
      const fallbackResult = await query(
        `SELECT p.company_id, p.role AS company_role, true AS is_default,
                c.name, c.slug, c.logo_url, c.plan, c.status
         FROM profiles p
         JOIN companies c ON c.id = p.company_id
         WHERE p.id = $1 AND p.company_id IS NOT NULL`,
        [user.id]
      );
      companies = fallbackResult.rows;
    }

    // Use the user's company_id from profiles as the active company
    const activeCompanyId = user.company_id;
    const activeCompany = companies.find(c => c.company_id === activeCompanyId) || companies[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.full_name,
        company_id: activeCompanyId,
        role: activeCompany?.company_role || user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse({
      token,
      company_id: activeCompanyId,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: activeCompany?.company_role || user.role,
      },
      companies: companies.map(c => ({
        id: c.company_id,
        name: c.name,
        slug: c.slug,
        logo_url: c.logo_url,
        plan: c.plan,
        status: c.status,
        role: c.company_role,
        is_default: c.is_default,
        is_active: c.company_id === activeCompanyId,
      })),
    });
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500);
  }
}
