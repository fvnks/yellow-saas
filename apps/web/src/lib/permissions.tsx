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
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: [],
  loading: true,
  hasPermission: () => true,
  hasAnyPermission: () => true,
  refresh: () => {},
});

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

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
      if (permissions.length === 0) return true;
      return permissions.some((p) => p.module === module && p.action === action);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (module: string) => {
      if (permissions.length === 0) return true;
      return permissions.some((p) => p.module === module);
    },
    [permissions]
  );

  return (
    <PermissionsContext.Provider value={{ permissions, loading, hasPermission, hasAnyPermission, refresh: load }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}
