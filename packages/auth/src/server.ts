import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../../db/src/client';

const JWT_SECRET = process.env.JWT_SECRET || 'yellow-erp-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  name: string;
  company_id: string;
  role: string;
  role_type?: 'company' | 'super_admin';
}

export interface SuperAdmin {
  id: string;
  email: string;
  name: string;
  role_type: 'super_admin';
  role: 'super_admin';
}

export type AuthUser = User | SuperAdmin;

export function isSuperAdmin(user: AuthUser): user is SuperAdmin {
  return user.role_type === 'super_admin';
}

export async function signIn(email: string, password: string): Promise<{ token: string; user: User } | null> {
  try {
    const result = await query(
      'SELECT id, email, name, password_hash, company_id, role FROM profiles WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) return null;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        company_id: user.company_id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company_id: user.company_id,
        role: user.role,
      },
    };
  } catch {
    return null;
  }
}

export async function signUp(email: string, password: string, name: string, companyName?: string): Promise<{ token: string; user: User } | null> {
  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const companyResult = await query(
      `INSERT INTO companies (name, slug, plan, status)
       VALUES ($1, $2, 'free', 'active')
       RETURNING id`,
      [companyName || `${name}'s Company`, name.toLowerCase().replace(/\s+/g, '-')]
    );

    const companyId = companyResult.rows[0].id;

    const userResult = await query(
      `INSERT INTO profiles (email, name, password_hash, company_id, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id, email, name, company_id, role`,
      [email, name, passwordHash, companyId]
    );

    const user = userResult.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        company_id: user.company_id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company_id: user.company_id,
        role: user.role,
      },
    };
  } catch {
    return null;
  }
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function signInSuperAdmin(email: string, password: string): Promise<{ token: string; user: SuperAdmin } | null> {
  try {
    const result = await query(
      'SELECT id, email, name, password_hash, is_active FROM super_admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) return null;

    const admin = result.rows[0];

    if (!admin.is_active) return null;
    if (!admin.password_hash) return null;

    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) return null;

    await query('UPDATE super_admins SET last_login_at = now() WHERE id = $1', [admin.id]);

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role_type: 'super_admin',
        role: 'super_admin',
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role_type: 'super_admin',
        role: 'super_admin',
      },
    };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}
