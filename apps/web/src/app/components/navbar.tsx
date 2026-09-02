'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ui/theme-toggle';

const navLinks = [
  { label: 'Módulos', href: '#modules' },
  { label: 'Beneficios', href: '#features' },
  { label: 'Precios', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#0F172A] dark:bg-amber-500 flex items-center justify-center shadow-md shadow-[#0F172A]/20 dark:shadow-amber-500/20 group-hover:scale-105 transition-transform duration-150">
            <span className="text-amber-400 dark:text-[#0F172A] font-bold text-base tracking-wider">Y</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[#0F172A] dark:text-white leading-none">
              Yellow <span className="text-amber-400">ERP</span>
            </span>
            <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-medium tracking-wide">SaaS para Chile</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#64748B]" />}
          </button>
          <Link
            href="/login"
            className="text-sm font-medium text-[#0F172A] dark:text-white hover:text-[#0F172A]/70 dark:hover:text-white/70 transition-colors duration-150 px-4 py-2"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#0F172A] dark:bg-amber-500 hover:bg-[#1E293B] dark:hover:bg-amber-400 text-white px-5 py-2.5 text-sm font-medium shadow-sm shadow-[#0F172A]/25 dark:shadow-amber-500/25 transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5"
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
          className="md:hidden p-2 text-[#0F172A] dark:text-white hover:text-[#0F172A]/70 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 border-b border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0F172A]',
          mobileOpen ? 'max-h-72' : 'max-h-0'
        )}
      >
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm font-medium text-[#0F172A] dark:text-white hover:text-[#0F172A]/70 dark:hover:text-white/70 py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-700 space-y-2">
            <button
              onClick={toggle}
              className="flex items-center gap-2 w-full text-sm font-medium text-[#64748B] dark:text-slate-400 py-2"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
            <Link
              href="/login"
              className="block text-sm font-medium text-[#0F172A] dark:text-white py-2 text-center rounded-xl border border-[#E2E8F0] dark:border-slate-700"
              onClick={() => setMobileOpen(false)}
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="block rounded-xl bg-[#0F172A] dark:bg-amber-500 hover:bg-[#1E293B] dark:hover:bg-amber-400 px-4 py-2.5 text-sm font-medium text-white text-center shadow-sm"
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
