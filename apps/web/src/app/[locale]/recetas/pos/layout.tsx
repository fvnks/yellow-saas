'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Monitor } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';

export default function PosStandaloneLayout({ children }: { children: ReactNode }) {
 return (
 <main className="bg-cloud min-h-screen text-ink transition-colors">
 <Toaster position="top-right" richColors closeButton />
 <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-mist bg-snow backdrop-blur-xl px-6">
 <div className="flex items-center gap-3">
 <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-peach/30 text-[#c64d00] border border-peach">
 <Monitor className="w-3.5 h-3.5 text-monday-violet" /> Módulo POS Ventas
 </span>
 </div>
 <div className="flex items-center gap-3">
 <Link href="/recetas" className="text-xs font-semibold text-slate-text hover:text-ink flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
 <ArrowLeft className="w-3.5 h-3.5 text-monday-violet" /> Volver a Recetas
 </Link>
 <ThemeToggle />
 </div>
 </header>
 <div className="p-6">{children}</div>
 </main>
 );
}