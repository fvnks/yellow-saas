import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#FACC15] animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Cargando Yellow ERP...</p>
      </div>
    </div>
  );
}
