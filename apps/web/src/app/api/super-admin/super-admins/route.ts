import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const result = await query(
      'SELECT id, email, name, avatar_url, is_active, last_login_at, created_at FROM super_admins ORDER BY created_at DESC'
    );
    return successResponse(result.rows);
  } catch (err) {
    console.error('Super admins list error:', err);
    return errorResponse('Error al obtener super admins', 500);
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const body = await request.json();
  const { email, name, password } = body;

  if (!email || !name || !password) return errorResponse('Email, nombre y contraseña son requeridos', 400);
  if (password.length < 8) return errorResponse('La contraseña debe tener al menos 8 caracteres', 400);

  try {
    const existing = await query('SELECT id FROM super_admins WHERE email = $1', [email]);
    if (existing.rows.length > 0) return errorResponse('Ya existe un super admin con ese email', 409);

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    await query(
      'INSERT INTO super_admins (email, name, password_hash, is_active) VALUES ($1, $2, $3, true)',
      [email, name, passwordHash]
    );

    return successResponse({ success: true });
  } catch (err) {
    console.error('Super admin create error:', err);
    return errorResponse('Error al crear super admin', 500);
  }
}
