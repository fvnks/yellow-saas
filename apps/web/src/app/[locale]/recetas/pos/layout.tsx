'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Monitor } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';

export default function PosStandaloneLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-[#F8FAFC] min-h-screen text-slate-900 transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Monitor className="w-3.5 h-3.5 text-amber-600" /> Módulo POS Ventas
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/recetas" className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 text-amber-500" /> Volver a Recetas
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="p-6">{children}</div>
    </main>
  );
}