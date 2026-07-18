'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2, ShoppingCart, Package, Users, Truck, Calculator, Wallet,
  BarChart3, Shield, Zap, Globe, ChevronRight, Menu, X, LogOut,
  ArrowRight, CheckCircle2, Monitor, CreditCard, Settings
} from 'lucide-react';

function getTokenPayload() {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  if (!authCookie) return null;
  const token = authCookie.split('=')[1];
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch { return null; }
}

const modules = [
  { icon: ShoppingCart, name: 'Ventas', desc: 'Cotizaciones, ordenes de venta, guias de despacho, facturacion' },
  { icon: Package, name: 'Inventario', desc: 'Stock multi-bodega, valorizacion, alertas de stock minimo' },
  { icon: Truck, name: 'Compras', desc: 'Ordenes de compra, recepcion de mercaderia, proveedores' },
  { icon: Users, name: 'CRM', desc: 'Gestion de clientes, pipeline de ventas, seguimiento comercial' },
  { icon: Wallet, name: 'Remuneraciones', desc: 'Nomina chilena, AFP, vacaciones, liquidaciones, boletas PDF' },
  { icon: Calculator, name: 'Contabilidad', desc: 'Asientos contables, balances, libros legales SII' },
  { icon: BarChart3, name: 'Reportes', desc: 'Dashboard ejecutivo, KPIs, analisis de rentabilidad' },
  { icon: Monitor, name: 'POS', desc: 'Punto de venta rapido, boletas, cierre de caja' },
];

const features = [
  { icon: Shield, title: 'Cumplimiento SII', desc: 'Boletas, facturas y notas de credito validas ante el SII de Chile.' },
  { icon: Zap, title: 'Rapidez', desc: 'Operaciones en tiempo real. Sin esperas, sin lentitud.' },
  { icon: Globe, title: 'Multi-tenant', desc: 'Datos aislados por empresa. Seguridad y privacidad garantizada.' },
  { icon: Settings, title: 'Configurable', desc: 'Adaptable a tu giro, tamano y forma de operar.' },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const payload = getTokenPayload();
    if (payload) setUser({ name: payload.name, email: payload.email });
  }, []);

  const handleLogout = () => {
    document.cookie = 'auth-token=; path=/; max-age=0';
    setUser(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">Yellow ERP</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#modulos" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Modulos</a>
              <a href="#funcionalidades" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Funcionalidades</a>
              <a href="#precios" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Precios</a>
              <Link href="/contact" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Contacto</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-slate-600">{user.name || user.email}</span>
                  <Link
                    href="/dashboard"
                    className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Cerrar sesion">
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
                    Iniciar sesion
                  </Link>
                  <Link
                    href="/register"
                    className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Comenzar gratis
                  </Link>
                </>
              )}
            </div>

            <button className="md:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <a href="#modulos" className="block text-sm text-slate-600">Modulos</a>
            <a href="#funcionalidades" className="block text-sm text-slate-600">Funcionalidades</a>
            <a href="#precios" className="block text-sm text-slate-600">Precios</a>
            <Link href="/contact" className="block text-sm text-slate-600">Contacto</Link>
            <hr className="border-slate-200" />
            {user ? (
              <>
                <p className="text-sm text-slate-500">{user.name || user.email}</p>
                <Link href="/dashboard" className="block bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium text-center">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-sm text-rose-600">Cerrar sesion</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-sm text-slate-600 text-center">Iniciar sesion</Link>
                <Link href="/register" className="block bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium text-center">
                  Comenzar gratis
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            ERP disena para PYMEs chilenas
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
            Tu empresa merece un{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              ERP inteligente
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Yellow ERP centraliza ventas, inventario, compras, contabilidad, remuneraciones y mas.
            Cumplimiento SII integrado, boletas electronicas y reportes en tiempo real.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Ir al Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Comenzar gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-8 py-3.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
          <p className="mt-4 text-xs text-slate-400">Sin tarjeta de credito. 14 dias gratis.</p>
        </div>
      </section>

      {/* ── Logos / Social proof ── */}
      <section className="py-12 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">Empresas que confian en Yellow ERP</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {['Constructora Norte', 'Distribuidora Sur', 'Comercio Express', 'Importaciones Andes', 'Retail Central'].map(name => (
              <span key={name} className="text-lg font-bold text-slate-900">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules ── */}
      <section id="modulos" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Todo lo que necesitas, en un solo lugar</h2>
            <p className="mt-3 text-slate-500">Modulos integrados que trabajan juntos sin fricciones.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map(m => (
              <div key={m.name} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-slate-300 transition-all group">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <m.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{m.name}</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="funcionalidades" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Por que Yellow ERP?</h2>
            <p className="mt-3 text-slate-500">Disena especificamente para la legislacion y operaciones chilenas.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(f => (
              <div key={f.title} className="text-center p-6">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chilean compliance ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Cumplimiento tributario chileno</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Boletas, facturas, notas de credito, guias de despacho y libros legales — todo conforme al SII.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { title: 'Boleta electronica', desc: 'Generacion automatica con validacion SII' },
              { title: 'Libros legales', desc: 'Libro de compras, ventas e IVA integrados' },
              { title: 'RUT automático', desc: 'Validacion de RUT en clientes y proveedores' },
            ].map(item => (
              <div key={item.title} className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-left">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-3" />
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="precios" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Simple y transparente</h2>
            <p className="mt-3 text-slate-500">Sin costos ocultos. Paga solo lo que usas.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                name: 'Starter',
                price: '$29.900',
                period: '/mes',
                desc: 'Para emprendedores',
                features: ['5 usuarios', 'Ventas + Inventario', 'Boletas electronicas', 'Soporte por email'],
                cta: 'Comenzar',
                highlight: false,
              },
              {
                name: 'Growth',
                price: '$59.900',
                period: '/mes',
                desc: 'Para empresas en crecimiento',
                features: ['15 usuarios', 'Todos los modulos', 'API acceso', 'Remuneraciones', 'Soporte prioritario'],
                cta: 'Comenzar',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Personalizado',
                period: '',
                desc: 'Para grandes operaciones',
                features: ['Usuarios ilimitados', 'Customizaciones', 'SLA 99.9%', 'Account manager', 'Onboarding dedicado'],
                cta: 'Contactar',
                highlight: false,
              },
            ].map(plan => (
              <div key={plan.name} className={`rounded-2xl border p-8 ${plan.highlight ? 'border-slate-900 bg-slate-900 text-white shadow-xl scale-[1.02]' : 'border-slate-200 bg-white'}`}>
                <h3 className={`text-sm font-semibold ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className={`text-sm ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.period}</span>}
                </div>
                <p className={`mt-2 text-xs ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === 'Enterprise' ? '/register' : '/register'}
                  className={`mt-8 block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    plan.highlight
                      ? 'bg-white text-slate-900 hover:bg-slate-100'
                      : 'bg-slate-900 text-white hover:bg-black'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900">Comienza hoy mismo</h2>
          <p className="mt-4 text-slate-500">Configura tu ERP en minutos. Sin instalaciones, sin complicaciones.</p>
          <div className="mt-8">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Ir al Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Crear cuenta gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">Yellow ERP</span>
          </div>
          <p className="text-xs text-slate-400">2025 Yellow ERP. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="text-xs text-slate-400 hover:text-slate-600">Contacto</Link>
            <Link href="/terms" className="text-xs text-slate-400 hover:text-slate-600">Terminos</Link>
            <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-600">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
