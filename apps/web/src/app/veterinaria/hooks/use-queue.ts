'use client';
import { useState, useEffect, useCallback } from 'react';
import { getApiClient } from '@/lib/api-client';

export function useQueue() {
  const [queue, setQueue] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const api = getApiClient();
      const result = await api.getVetQueue();
      setQueue(result.queue || []);
      setCounts(result.counts || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { queue, counts, loading, error, refresh: fetch };
}
