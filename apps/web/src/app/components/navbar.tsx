'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Módulos', href: '#modules' },
  { label: 'Precios', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-primary flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">Y</span>
          </div>
          <span className="text-lg font-bold text-white">
            Yellow <span className="text-muted-foreground font-normal">ERP</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-foreground hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground hover:text-white transition-colors px-4 py-2"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98]"
          >
            Empezar Gratis
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          className="md:hidden p-2 cursor-pointer text-foreground hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 border-b border-border/60 bg-background',
          mobileOpen ? 'max-h-64' : 'max-h-0'
        )}
      >
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm font-medium text-foreground hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-border/60 space-y-2">
            <Link href="/login" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
              Iniciar Sesión
            </Link>
            <Link href="/register" className="block rounded-lg bg-primary hover:bg-primary/90 px-4 py-2 text-sm font-medium text-white text-center" onClick={() => setMobileOpen(false)}>
              Empezar Gratis
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
