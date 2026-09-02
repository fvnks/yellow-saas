'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  useEffect(() => { console.error('[LocaleError]', error.message, error.digest); }, [error]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="text-center max-w-sm mx-4">
        <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-rose-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Algo sali mal</h2>
        <p className="text-sm text-slate-500 mb-6">Ha ocurrido un error inesperado. Inténtalo de nuevo.</p>
        <button onClick={reset} className="inline-flex items-center gap-2 bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    </div>
  );
}
