'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Monitor } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';

export default function PosStandaloneLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Monitor className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">POS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/recetas" className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Volver a Recetas
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="p-4">{children}</div>
    </main>
  );
}
