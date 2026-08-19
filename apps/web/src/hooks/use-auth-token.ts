'use client'; import { useMemo } from 'react'; interface AuthTokenPayload { id?: string; email?: string; name?: string; role?: string; role_type?: string; company_id?: string;
} function parseJwtPayload(token: string): AuthTokenPayload | null { try { const base64Url = token.split('.')[1]; const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); const jsonPayload = decodeURIComponent( atob(base64) .split('') .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)) .join('') ); return JSON.parse(jsonPayload); } catch { return null; }
} function getAuthTokenFromCookie(): string | null { if (typeof window === 'undefined') return null; const cookies = document.cookie.split(';'); const authCookie = cookies.find(c => c.trim().startsWith('auth-token=')); return authCookie ? authCookie.split('=')[1] : null;
} export function useAuthToken() { const payload = useMemo(() => { const token = getAuthTokenFromCookie(); if (!token) return null; return parseJwtPayload(token); }, []); return payload;
} export function getAuthTokenPayload(): AuthTokenPayload | null { const token = getAuthTokenFromCookie(); if (!token) return null; return parseJwtPayload(token);
}
