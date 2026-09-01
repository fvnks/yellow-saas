import { Shield, Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <Shield className="w-8 h-8 text-violet-400 animate-pulse" />
        <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Cargando Console...</p>
      </div>
    </div>
  );
}
