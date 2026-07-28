'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { getApiClient } from './api-client';

interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

interface PermissionsContextType {
  permissions: Permission[];
  loading: boolean;
  hasPermission: (module: string, action: string) => boolean;
  hasAnyPermission: (module: string) => boolean;
  refresh: () => void;
  isOwner: boolean;
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: [],
  loading: true,
  hasPermission: () => true,
  hasAnyPermission: () => true,
  refresh: () => {},
  isOwner: false,
});

function getUserRole(): string {
  if (typeof window === 'undefined') return 'member';
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  if (!authCookie) return 'member';
  try {
    const token = authCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || 'member';
  } catch {
    return 'member';
  }
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const userRole = getUserRole();
  const isOwner = userRole === 'owner' || userRole === 'admin';

  const load = useCallback(() => {
    const api = getApiClient();
    api.getPermissions()
      .then((data) => {
        setPermissions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hasPermission = useCallback(
    (module: string, action: string) => {
      // While loading, allow everything so server/client initial render matches
      if (loading) return true;
      // Owner and admin see everything
      if (isOwner) return true;
      return permissions.some((p) => p.module === module && p.action === action);
    },
    [permissions, isOwner, loading]
  );

  const hasAnyPermission = useCallback(
    (module: string) => {
      if (loading) return true;
      if (isOwner) return true;
      return permissions.some((p) => p.module === module);
    },
    [permissions, isOwner, loading]
  );

  return (
    <PermissionsContext.Provider value={{ permissions, loading, hasPermission, hasAnyPermission, refresh: load, isOwner }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}
