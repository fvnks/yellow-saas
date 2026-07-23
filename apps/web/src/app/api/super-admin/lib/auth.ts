import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'yellow-erp-secret-key-change-in-production');

export async function verifySuperAdmin(request: NextRequest): Promise<{ id: string; email: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    // Try cookie
    const cookieToken = request.cookies.get('auth-token')?.value;
    if (!cookieToken) return null;
    try {
      const { payload } = await jwtVerify(cookieToken, JWT_SECRET);
      if (payload.role_type !== 'super_admin') return null;
      return { id: payload.id as string, email: payload.email as string };
    } catch {
      return null;
    }
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role_type !== 'super_admin') return null;
    return { id: payload.id as string, email: payload.email as string };
  } catch {
    return null;
  }
}
