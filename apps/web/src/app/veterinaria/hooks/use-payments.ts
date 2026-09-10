'use client';
import { useState, useEffect, useCallback } from 'react';
import { getApiClient } from '@/lib/api-client';

export function usePayments(params?: Record<string, string>) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const api = getApiClient();
      const result = await api.getVetPayments(params);
      setData(result.data || []);
      setPagination(result.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, pagination, refresh: fetch };
}
