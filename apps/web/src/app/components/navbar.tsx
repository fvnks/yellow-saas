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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#E6EFF5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#1814F3] flex items-center justify-center shadow-md shadow-[#1814F3]/20 group-hover:scale-105 transition-transform duration-150">
            <span className="text-white font-bold text-base tracking-wider">Y</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[#232323] leading-none">
              Yellow <span className="text-[#1814F3]">ERP</span>
            </span>
            <span className="text-[10px] text-[#718EBF] font-medium tracking-wide">SaaS para Chile</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-[#718EBF] hover:text-[#1814F3] transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-[#232323] hover:text-[#1814F3] transition-colors duration-150 px-4 py-2"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#1814F3] hover:bg-[#1612D3] text-white px-5 py-2.5 text-sm font-medium shadow-sm shadow-[#1814F3]/25 transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5"
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
          className="md:hidden p-2 text-[#232323] hover:text-[#1814F3] rounded-lg hover:bg-[#F5F7FA] transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 border-b border-[#E6EFF5] bg-white',
          mobileOpen ? 'max-h-64' : 'max-h-0'
        )}
      >
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm font-medium text-[#232323] hover:text-[#1814F3] py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-[#E6EFF5] space-y-2">
            <Link
              href="/login"
              className="block text-sm font-medium text-[#232323] py-2 text-center rounded-xl border border-[#E6EFF5]"
              onClick={() => setMobileOpen(false)}
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="block rounded-xl bg-[#1814F3] hover:bg-[#1612D3] px-4 py-2.5 text-sm font-medium text-white text-center shadow-sm"
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
