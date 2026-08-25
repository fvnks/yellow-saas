'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Módulos', href: '#modules' },
  { label: 'Características', href: '#features' },
  { label: 'Precios', href: '#pricing' },
  { label: 'Preguntas Frecuentes', href: '#faq' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E6EFF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#1814F3] flex items-center justify-center text-white font-bold shadow-md shadow-[#1814F3]/20 group-hover:scale-105 transition-transform duration-150">
            <span className="text-base tracking-tight">Y</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#232323] tracking-tight leading-tight flex items-center gap-1.5">
              Yellow ERP
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Chile SII
              </span>
            </span>
            <span className="text-[10px] text-[#718EBF] font-medium">Empresarial & SaaS</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-semibold text-[#718EBF] hover:text-[#1814F3] transition-colors duration-150 uppercase tracking-wider"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-[#232323] hover:text-[#1814F3] px-3.5 py-2 transition-colors duration-150"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/select"
            className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98] flex items-center gap-2 shadow-sm shadow-[#1814F3]/25"
          >
            Ingresar a Módulos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          className="md:hidden p-2 text-[#232323] hover:text-[#1814F3] rounded-xl border border-[#E6EFF5] transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={cn(
          'md:hidden border-b border-[#E6EFF5] bg-white transition-all duration-200 overflow-hidden',
          mobileOpen ? 'max-h-96 opacity-100 py-4 px-6 space-y-4' : 'max-h-0 opacity-0 p-0'
        )}
      >
        <nav className="flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-[#232323] hover:text-[#1814F3] py-1.5 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="pt-3 border-t border-[#E6EFF5] flex flex-col gap-2">
          <Link
            href="/login"
            className="w-full text-center text-sm font-medium text-[#232323] py-2 rounded-xl border border-[#E6EFF5]"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/select"
            className="w-full text-center bg-[#1814F3] hover:bg-[#1612D3] text-white py-2.5 rounded-xl text-sm font-medium shadow-sm flex items-center justify-center gap-2"
          >
            Ingresar a Módulos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
