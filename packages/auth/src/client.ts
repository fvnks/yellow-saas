import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'yellow-erp-secret-key-change-in-production';

interface UserPayload {
  id: string;
  email: string;
  name: string;
  company_id: string;
  role: string;
}

export function getSessionFromCookie(): UserPayload | null {
  if (typeof window === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));

  if (!authCookie) return null;

  const token = authCookie.split('=')[1];

  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
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
  window.location.href = '/login';
}
