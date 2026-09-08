import { useEffect, useState } from 'react';
import { getCompanyIdFromToken } from '@/lib/api-client';
import { IVA_RATE } from '@/lib/erp-config';

export function useIvaRate() {
  const [ivaRate, setIvaRate] = useState<number>(IVA_RATE);
  const [loading, setLoading] = useState(true);

  const getToken = () =>
    document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

  useEffect(() => {
    const companyId = getCompanyIdFromToken();
    if (!companyId) { setLoading(false); return; }
    fetch(`/api/companies/${companyId}/settings/iva`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => { if (data.success && typeof data.data?.iva_rate === 'number') setIvaRate(data.data.iva_rate); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { ivaRate, loading };
}
