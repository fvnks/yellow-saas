'use client';

import { useEffect } from 'react';
import { ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AdminError]', error.message, error.digest);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center max-w-sm mx-4">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7 text-rose-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Error en Console</h2>
        <p className="text-sm text-slate-400 mb-6">
          No se pudo cargar la consola de administración.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </div>
    </div>
  );
}
