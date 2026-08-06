import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('La variable de entorno JWT_SECRET es requerida. Configúrala antes de iniciar la aplicación.');
  }
  return secret;
}

interface UserPayload {
  id: string;
  email: string;
  name: string;
  company_id?: string;
  role: string;
  role_type?: 'company' | 'super_admin';
}

export function getSessionFromCookie(): UserPayload | null {
  if (typeof window === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));

  if (!authCookie) return null;

  const token = authCookie.split('=')[1];

  try {
    return jwt.verify(token, getJwtSecret()) as UserPayload;
  } catch {
    return null;
  }
}

export function isSuperAdmin(): boolean {
  const session = getSessionFromCookie();
  return session?.role_type === 'super_admin';
}

export async function getCompanyId(): Promise<string | null> {
  const session = getSessionFromCookie();
  return session?.company_id ?? null;
}

export async function getUserRole(): Promise<string | null> {
  const session = getSessionFromCookie();
  return session?.role ?? null;
}

export async function getUserProfile(): Promise<UserPayload | null> {
  return getSessionFromCookie();
}

export function logout() {
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  const session = getSessionFromCookie();
  if (session?.role_type === 'super_admin') {
    window.location.href = '/super-admin/login';
  } else {
    window.location.href = '/login';
  }
}
