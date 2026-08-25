'use client'; import { useMemo } from 'react';

export interface AuthTokenPayload {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  role_type?: string;
  company_id?: string;
  impersonated?: boolean;
}

function decodeProfileCookie(): AuthTokenPayload | null {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const profileCookie = cookies.find(c => c.trim().startsWith('yellow-profile='));
  if (!profileCookie) return null;
  try {
    const raw = profileCookie.split('=').slice(1).join('=').replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(raw).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function useAuthToken() {
  const payload = useMemo(() => decodeProfileCookie(), []);
  return payload;
}

export function getAuthTokenPayload(): AuthTokenPayload | null {
  return decodeProfileCookie();
}
