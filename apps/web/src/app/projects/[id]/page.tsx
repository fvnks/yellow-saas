'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProjectDetailRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      router.replace(`/dashboard/projects/${params.id}`);
    }
  }, [params.id, router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse text-sm text-slate-400">Redirigiendo...</div>
    </div>
  );
}
