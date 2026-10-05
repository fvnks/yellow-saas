'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronRight, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SiteLiquidButton } from '@/components/landing/SiteLiquidButton';
import { useAuthToken } from '@/hooks/use-auth-token';

const navLinks = [
  { label: 'Módulos', href: '#modules' },
  { label: 'Beneficios', href: '#features' },
  { label: 'Precios', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Diseño Web', href: '/diseno-web' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const user = useAuthToken();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
    }
  };

  return (
  <header className="fixed top-0 left-0 right-0 z-50 bg-snow/90 backdrop-blur-2xl border-b border-mist shadow-[0_1px_0_0_rgba(208,212,228,0.5)]">
  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
  {/* Logo */}
  <Link href="/" className="flex items-center gap-2.5 group">
  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFA500] via-[#33dbdb] via-[#33d58e] via-[#F5C518] via-[#fc527d] to-[#FFA500] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-150" style={{ background: 'conic-gradient(from 270deg, #FFA500 15%, #33dbdb 40%, #33d58e 55%, #F5C518 65%, #fc527d 85%, #FFA500 100%)' }}>
  <div className="w-7 h-7 bg-snow rounded-full flex items-center justify-center">
  <span className="text-sunshine-ink font-bold text-xs">Y</span>
  </div>
  </div>
  <span className="text-lg font-bold text-ink">
  Yellow <span className="text-sunshine-ink">ERP</span>
  </span>
  </Link>

  {/* Desktop nav */}
  <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
  {navLinks.map((link) => (
  <a
  key={link.label}
  href={link.href}
  className="group relative -mx-3 rounded-full px-3 py-2 text-sm font-medium text-slate-text transition-colors duration-150 hover:bg-cloud hover:text-ink"
  >
  {link.label}
  {/* Underline de acento que crece desde la izquierda */}
  <span
  aria-hidden="true"
  className="pointer-events-none absolute inset-x-3 bottom-1.5 h-px origin-left scale-x-0 rounded-full bg-sunshine transition-transform duration-200 ease-out group-hover:scale-x-100"
  />
  </a>
  ))}
  </nav>

  {/* Desktop CTA / User Menu */}
  <div className="hidden lg:flex items-center gap-2 xl:gap-3">
  {user ? (
    <div className="relative">
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="flex items-center gap-2 -mx-3 rounded-full px-3 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-cloud"
        aria-label="Menú de usuario"
        aria-expanded={userMenuOpen}
      >
        <div className="w-8 h-8 rounded-full bg-sunshine/10 flex items-center justify-center">
          <User className="w-4 h-4 text-sunshine-ink" />
        </div>
        <span className="hidden sm:block">{user.name || 'Usuario'}</span>
        <ChevronDown className="w-4 h-4 text-slate-text" />
      </button>
      
      {userMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setUserMenuOpen(false)} 
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-48 bg-snow border border-mist rounded-xl shadow-xl py-1.5 z-50">
            <div className="px-3 py-2 border-b border-mist">
              <p className="text-sm font-semibold text-ink truncate">{user.name || 'Usuario'}</p>
              <p className="text-xs text-slate-text truncate">{user.email}</p>
            </div>
            <Link
              href="/select"
              className="block px-3 py-2 text-sm text-ink hover:bg-cloud transition-colors"
              onClick={() => setUserMenuOpen(false)}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Módulos
            </Link>
            <Link
              href="/mi-cuenta"
              className="block px-3 py-2 text-sm text-ink hover:bg-cloud transition-colors"
              onClick={() => setUserMenuOpen(false)}
            >
              <User className="w-4 h-4 inline mr-2" />
              Mi Cuenta
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 inline mr-2" />
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  ) : (
    <>
      <Link
      href="/login"
      className="-mx-4 rounded-full px-4 py-2 text-sm font-medium text-slate-text transition-colors duration-150 hover:bg-cloud hover:text-ink"
      >
      Iniciar Sesión
      </Link>
      <SiteLiquidButton href="/register" variant="primary" className="px-5 py-2.5">
      <span>Comenzar Ahora</span>
      <ChevronRight className="w-4 h-4" />
      
      </SiteLiquidButton>
    </>
  )}
  </div>

  {/* Mobile toggle */}
  <button
  onClick={() => setMobileOpen(!mobileOpen)}
  aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
  aria-expanded={mobileOpen}
  className="lg:hidden p-2 text-ink hover:text-ink/70 rounded-md hover:bg-cloud transition-colors"
  >
  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
  </button>
  </div>

  {/* Mobile menu */}
  <div
  className={cn(
  'lg:hidden overflow-hidden transition-all duration-300 border-b border-mist bg-snow',
  mobileOpen ? 'max-h-96' : 'max-h-0'
  )}
  >
  <div className="px-4 py-4 space-y-3">
  {navLinks.map((link) => (
  <a
  key={link.label}
  href={link.href}
  className="-mx-3 block rounded-full px-3 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-cloud"
  onClick={() => setMobileOpen(false)}
  >
  {link.label}
  </a>
  ))}
  <div className="pt-3 border-t border-mist space-y-2">
  {user ? (
    <div className="space-y-2">
      <Link
        href="/select"
        className="block text-sm font-medium text-ink py-2 rounded-md hover:bg-cloud transition-colors"
        onClick={() => setMobileOpen(false)}
      >
        <Settings className="w-4 h-4 inline mr-2" />
        Módulos
      </Link>
      <Link
        href="/mi-cuenta"
        className="block text-sm font-medium text-ink py-2 rounded-md hover:bg-cloud transition-colors"
        onClick={() => setMobileOpen(false)}
      >
        <User className="w-4 h-4 inline mr-2" />
        Mi Cuenta
      </Link>
      <button
        onClick={handleLogout}
        className="w-full text-left text-sm font-medium text-red-600 py-2 rounded-md hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4 inline mr-2" />
        Cerrar sesión
      </button>
    </div>
  ) : (
    <>
      <Link
      href="/login"
      className="block text-sm font-medium text-ink py-2 text-center rounded-md border border-mist transition-colors duration-150 hover:bg-cloud"
      onClick={() => setMobileOpen(false)}
      >
      Iniciar Sesión
      </Link>
      <SiteLiquidButton href="/register" variant="primary" className="px-4 py-2.5 text-center" onClick={() => setMobileOpen(false)}>
      Comenzar Ahora
      </SiteLiquidButton>
    </>
  )}
  </div>
  </div>
  </div>
  </header>
  );
}