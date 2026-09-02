import { notFound } from 'next/navigation';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-20 w-20 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-200 mb-6">
        <span className="text-4xl">🔧</span>
      </div>
      <h1 className="text-3xl font-black text-[#0F172A] mb-3">Página No Encontrada</h1>
      <p className="text-slate-500 max-w-md mb-8">
        La página que estás buscando no existe o ha sido movida.
      </p>
      <a
        href="/auto-talleres"
        className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
      >
        Volver al Inicio
      </a>
    </div>
  );
}
