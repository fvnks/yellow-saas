'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Apoderado {
  id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  email: string;
  telefono?: string;
  pupilos?: Array<{
    id: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno?: string;
    rut: string;
    curso_nombre: string;
  }>;
}

export function usePortalAuth() {
  const router = useRouter();
  const [apoderado, setApoderado] = useState<Apoderado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verifyToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('portal_token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/portal-apoderado');
        return;
      }

      const res = await fetch('/api/portal-apoderado/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Token inválido');
      }

      const data = await res.json();
      setApoderado(data.data.apoderado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
      router.push('/portal-apoderado');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    document.cookie = 'portal_token=; path=/; max-age=0';
    setApoderado(null);
    router.push('/portal-apoderado');
  }, [router]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return {
    apoderado,
    loading,
    error,
    logout,
    verifyToken,
  };
}
