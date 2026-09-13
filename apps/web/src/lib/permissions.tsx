'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { getApiClient } from './api-client';
import { getAuthTokenPayload } from '@/hooks/use-auth-token';

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
  hasPermission: () => false,
  hasAnyPermission: () => false,
  refresh: () => {},
  isOwner: false,
});

function getUserRole(): string {
  const payload = getAuthTokenPayload();
  return payload?.role || 'member';
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const userRole = getUserRole();
  const isOwner = userRole === 'owner' || userRole === 'admin';

  const load = useCallback(() => {
    try {
      const api = getApiClient();
      api.getMyPermissions()
        .then((data: any) => {
          const perms = data?.permissions || (Array.isArray(data) ? data : []);
          setPermissions(perms);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hasPermission = useCallback(
    (module: string, action: string) => {
      if (loading) return false;
      if (isOwner) return true;
      return permissions.some((p) => p.module === module && p.action === action);
    },
    [permissions, isOwner, loading]
  );

  const hasAnyPermission = useCallback(
    (module: string) => {
      if (loading) return false;
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
