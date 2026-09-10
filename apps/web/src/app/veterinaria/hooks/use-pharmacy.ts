'use client';
import { useState, useCallback } from 'react';
import { getApiClient } from '@/lib/api-client';

export function usePharmacy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispenseMedication = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const api = getApiClient();
      return { success: true };
    } catch (e: any) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, dispenseMedication };
}
