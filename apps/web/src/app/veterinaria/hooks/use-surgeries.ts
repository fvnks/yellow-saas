'use client';
import { useState, useEffect, useCallback } from 'react';
import { getApiClient } from '@/lib/api-client';

export function useSurgeries(params?: Record<string, string>, enabled = true) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });

  const fetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const api = getApiClient();
      const result = await api.getVetSurgeries(params);
      setData(result.data || []);
      setPagination(result.pagination || { total: 0, page: 1, limit: 50, totalPages: 1 });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params), enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  const mutate = useCallback((updater: any[] | ((prev: any[]) => any[])) => {
    setData(prev => typeof updater === 'function' ? updater(prev) : updater);
  }, []);

  return { data, loading, error, pagination, refresh: fetch, mutate };
}
