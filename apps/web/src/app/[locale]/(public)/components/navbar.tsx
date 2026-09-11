'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
 { label: 'Módulos', href: '#modules' },
 { label: 'Beneficios', href: '#features' },
 { label: 'Precios', href: '#pricing' },
 { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
 const [mobileOpen, setMobileOpen] = useState(false);

 return (
 <header className="fixed top-0 left-0 right-0 z-50 bg-snow/90 backdrop-blur-2xl border-b border-mist shadow-[0_1px_0_0_rgba(208,212,228,0.5)]">
 <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
 {/* Logo */}
 <Link href="/" className="flex items-center gap-2.5 group">
 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8181ff] via-[#33dbdb] via-[#33d58e] via-[#ffd633] via-[#fc527d] to-[#8181ff] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-150" style={{ background: 'conic-gradient(from 270deg, #8181ff 15%, #33dbdb 40%, #33d58e 55%, #ffd633 65%, #fc527d 85%, #8181ff 100%)' }}>
 <div className="w-7 h-7 bg-snow rounded-full flex items-center justify-center">
 <span className="text-monday-violet font-bold text-xs">Y</span>
 </div>
 </div>
 <span className="text-lg font-bold text-ink">
 Yellow <span className="text-monday-violet">ERP</span>
 </span>
 </Link>

 {/* Desktop nav */}
 <nav className="hidden md:flex items-center gap-8">
 {navLinks.map((link) => (
 <a
 key={link.label}
 href={link.href}
 className="text-sm font-medium text-slate-text hover:text-ink transition-colors duration-150"
 >
 {link.label}
 </a>
 ))}
 </nav>

 {/* Desktop CTA */}
 <div className="hidden md:flex items-center gap-3">
 <Link
 href="/login"
 className="text-sm font-medium text-slate-text hover:text-ink transition-colors duration-150 px-4 py-2"
 >
 Iniciar Sesión
 </Link>
 <Link
 href="/register"
 className="rounded-[160px] bg-monday-violet hover:bg-monday-violet-hover text-white px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5"
 >
 <span>Empezar Gratis</span>
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>

 {/* Mobile toggle */}
 <button
 onClick={() => setMobileOpen(!mobileOpen)}
 aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
 aria-expanded={mobileOpen}
 className="md:hidden p-2 text-ink hover:text-ink/70 rounded-md hover:bg-cloud transition-colors"
 >
 {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
 </button>
 </div>

 {/* Mobile menu */}
 <div
 className={cn(
 'md:hidden overflow-hidden transition-all duration-300 border-b border-mist bg-snow',
 mobileOpen ? 'max-h-72' : 'max-h-0'
 )}
 >
 <div className="px-4 py-4 space-y-3">
 {navLinks.map((link) => (
 <a
 key={link.label}
 href={link.href}
 className="block text-sm font-medium text-ink hover:text-ink/70 py-1"
 onClick={() => setMobileOpen(false)}
 >
 {link.label}
 </a>
 ))}
 <div className="pt-3 border-t border-mist space-y-2">
 <Link
 href="/login"
 className="block text-sm font-medium text-ink py-2 text-center rounded-md border border-mist"
 onClick={() => setMobileOpen(false)}
 >
 Iniciar Sesión
 </Link>
 <Link
 href="/register"
 className="block rounded-[160px] bg-monday-violet hover:bg-monday-violet-hover px-4 py-2.5 text-sm font-medium text-white text-center shadow-sm"
 onClick={() => setMobileOpen(false)}
 >
 Empezar Gratis
 </Link>
 </div>
 </div>
 </div>
 </header>
 );
}
