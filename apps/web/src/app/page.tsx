'use client';

import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Shield,
  Truck,
  Briefcase,
  ChevronRight,
  Check,
  Zap,
  Building2,
  Lock,
  ArrowRight,
  CreditCard,
  Wallet,
  TrendingUp,
  ShieldCheck,
  FolderKanban,
  FileCheck2,
  Clock,
  Sparkles,
  Layers,
  LayoutDashboard
} from 'lucide-react';

import { Navbar } from './components/navbar';
import { Footer } from './components/footer';

const MODULES = [
  {
    icon: Package,
    title: 'Inventario & Bodegas',
    description: 'Control de stock en tiempo real, trazabilidad por lote y serie, alertas de reorden y transferencias multi-bodega.',
    iconBg: 'bg-blue-50 text-blue-600',
    tag: 'Operativo',
    link: '/select'
  },
  {
    icon: ShoppingCart,
    title: 'Ventas & DTE',
    description: 'Cotizaciones, órdenes de venta y emisión instantánea de facturas electrónicas con integración directa al SII.',
    iconBg: 'bg-emerald-50 text-emerald-600',
    tag: 'SII Chile',
    link: '/select'
  },
  {
    icon: Truck,
    title: 'Compras & Proveedores',
    description: 'Gestión de órdenes de compra, recepción de mercadería, gestión de proveedores y facturas de adquisición.',
    iconBg: 'bg-amber-50 text-amber-600',
    tag: 'Abastecimiento',
    link: '/select'
  },
  {
    icon: BarChart3,
    title: 'Contabilidad Automática',
    description: 'Libro diario, balance de comprobación y saldos, conciliación bancaria y estados de resultados en tiempo real.',
    iconBg: 'bg-[#1814F3]/10 text-[#1814F3]',
    tag: 'Financiero',
    link: '/select'
  },
  {
    icon: Users,
    title: 'Nómina & Recursos Humanos',
    description: 'Gestión de contratos, asistencia, liquidaciones de sueldo, control de vacaciones y evaluaciones de desempeño.',
    iconBg: 'bg-purple-50 text-purple-600',
    tag: 'RRHH',
    link: '/hr'
  },
  {
    icon: FolderKanban,
    title: 'Gestión de Proyectos',
    description: 'Diagramas Gantt, tableros Kanban, registro de horas trabajadas y presupuestos por proyecto.',
    iconBg: 'bg-rose-50 text-rose-600',
    tag: 'Operaciones',
    link: '/projects'
  },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Certificación SII 100% Cumplida',
    desc: 'Generación, firmas digitalizadas y envío de DTE (Facturas, Guías, Notas de Crédito) directamente al Servicio de Impuestos Internos.'
  },
  {
    icon: Layers,
    title: 'Arquitectura Multi-Empresa & Multi-Bodega',
    desc: 'Gestiona múltiples razones sociales, sucursales y bodegas desde una sola cuenta unificada con permisos por rol.'
  },
  {
    icon: Zap,
    title: 'Tiempo Real & Automatización',
    desc: 'Asientos contables y sincronización de stock automáticos cada vez que se emite un documento de venta o compra.'
  },
  {
    icon: Lock,
    title: 'Seguridad Empresarial RLS & Audit Log',
    desc: 'Políticas de seguridad a nivel de fila (RLS en Supabase) e historial detallado de auditoría para cada transacción.'
  }
];

const PRICING = [
  {
    name: 'Starter PyME',
    price: '$29.900',
    period: '/mes + IVA',
    description: 'Ideal para pequeñas empresas que inician su digitalización contable y comercial.',
    features: [
      'Hasta 3 Usuarios activos',
      'Facturación electrónica SII ilimitada',
      'Inventario básico y 1 Bodega',
      'Ventas, Cotizaciones y Compras',
      'Soporte por email preferente'
    ],
    recommended: false,
    cta: 'Probar Gratis 14 Días'
  },
  {
    name: 'Business Pro',
    price: '$59.900',
    period: '/mes + IVA',
    description: 'Para empresas en crecimiento que requieren control total de inventario, RRHH y proyectos.',
    features: [
      'Hasta 10 Usuarios activos',
      'Facturación electrónica SII ilimitada',
      'Multi-bodega & trazabilidad por lote',
      'Módulo de Recursos Humanos & Nómina',
      'Gestión de Proyectos & Kanban',
      'Contabilidad automática & Estados financieros',
      'Soporte telefónico y chat directo'
    ],
    recommended: true,
    cta: 'Comenzar Ahora'
  },
  {
    name: 'Enterprise Multi-Company',
    price: '$119.900',
    period: '/mes + IVA',
    description: 'Solución a medida para grupos empresariales y corporaciones multi-razón social.',
    features: [
      'Usuarios ilimitados',
      'Multi-empresa y consolidación contable',
      'API REST personalizada & Webhooks',
      'SLA garantizado 99.9%',
      'Ejecutivo de cuenta dedicado',
      'Capacitación e integración presencial/remota'
    ],
    recommended: false,
    cta: 'Contactar Ventas'
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#232323] font-sans antialiased selection:bg-[#1814F3]/10 selection:text-[#1814F3]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E6EFF5] shadow-xs text-xs font-semibold text-[#1814F3]">
            <Sparkles className="w-4 h-4 text-[#1814F3]" />
            <span>Sistema ERP Multi-Tenant para PyMEs de Chile</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16DBCC] animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#232323] leading-[1.15]">
            La plataforma ERP que simplifica la operación de tu <span className="text-[#1814F3]">empresa</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#718EBF] max-w-2xl leading-relaxed">
            Centraliza inventarios, ventas, compras, contabilidad, nómina y facturación electrónica SII en una suite moderna, rápida e intuitiva.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
            <Link
              href="/select"
              className="w-full sm:w-auto bg-[#1814F3] hover:bg-[#1612D3] text-white px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-[#1814F3]/25"
            >
              Probar Módulos Gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white border border-[#E6EFF5] hover:bg-[#F5F7FA] text-[#232323] px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 shadow-xs"
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Guarantee Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-[#718EBF]">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Facturación SII 100% Homologada
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Sin contratos forzosos
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Implementación en 24 horas
            </span>
          </div>

        </div>

        {/* Product Preview Card Mockup */}
        <div className="mt-12 md:mt-16 bg-white border border-[#E6EFF5] rounded-2xl shadow-xl overflow-hidden p-3 sm:p-6">
          <div className="bg-[#F5F7FA] border border-[#E6EFF5] rounded-xl p-4 sm:p-6 space-y-6">
            
            {/* Mock Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E6EFF5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1814F3] text-white flex items-center justify-center font-bold">
                  Y
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#232323]">Panel Principal ERP</h3>
                  <p className="text-xs text-[#718EBF]">Empresa: Comercial e Industrial SpA • RUT: 77.890.123-4</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● SII En Línea
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Plan Business
                </span>
              </div>
            </div>

            {/* Mock KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Ventas del Mes</p>
                  <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-bold text-[#232323]">$48.290.000</p>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">+18.4% vs mes anterior</p>
              </div>

              <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">DTE Emitidos (SII)</p>
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-bold text-[#232323]">1,420 DTEs</p>
                <p className="text-[11px] text-[#718EBF] mt-1 font-medium">100% aceptados por SII</p>
              </div>

              <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Stock Valorizado</p>
                  <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-bold text-[#232323]">$132.500.000</p>
                <p className="text-[11px] text-[#718EBF] mt-1 font-medium">3 Bodegas operativas</p>
              </div>

              <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Colaboradores RRHH</p>
                  <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-bold text-[#232323]">42 Contratos</p>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">Liquidaciones al día</p>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Modules Section */}
      <section id="modules" className="py-16 md:py-24 bg-white border-y border-[#E6EFF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[10px] font-semibold text-[#1814F3] uppercase tracking-wider bg-[#1814F3]/10 px-3 py-1 rounded-full">
              Módulos Integrados
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#232323] tracking-tight">
              Una suite completa de módulos para gobernar tu negocio
            </h2>
            <p className="text-sm sm:text-base text-[#718EBF]">
              Cada módulo funciona de manera autónoma o interconectada, garantizando consistencia en tus datos operacionales y financieros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.title}
                  className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${mod.iconBg}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {mod.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#232323] mb-2 group-hover:text-[#1814F3] transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-[#718EBF] leading-relaxed mb-6">
                      {mod.description}
                    </p>
                  </div>

                  <Link
                    href={mod.link}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1814F3] hover:text-[#1612D3] transition-colors"
                  >
                    Explorar Módulo <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-[10px] font-semibold text-[#1814F3] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Estándar Enterprise
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#232323] tracking-tight">
            Diseñado para cumplir con la normativa chilena y exigencias operativas
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="bg-white border border-[#E6EFF5] rounded-2xl p-6 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1814F3]/10 text-[#1814F3] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#232323] mb-1">{feat.title}</h3>
                  <p className="text-xs text-[#718EBF] leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-white border-t border-[#E6EFF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[10px] font-semibold text-[#1814F3] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Planes Transparentes
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#232323] tracking-tight">
              Precios claros, sin costos ocultos
            </h2>
            <p className="text-sm text-[#718EBF]">
              Elige el plan adecuado para el tamaño de tu empresa. Todos los planes incluyen actualizaciones continuas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 relative ${
                  plan.recommended
                    ? 'border-[#1814F3] shadow-lg ring-2 ring-[#1814F3]/20'
                    : 'border-[#E6EFF5] shadow-xs'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1814F3] text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Más Popular
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-[#232323] mb-1">{plan.name}</h3>
                  <p className="text-xs text-[#718EBF] min-h-[36px] mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-extrabold text-[#232323]">{plan.price}</span>
                    <span className="text-xs text-[#718EBF] font-medium">{plan.period}</span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[#E6EFF5] mb-6">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs text-[#232323]">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/select"
                  className={`w-full py-3 rounded-xl text-xs font-semibold text-center transition-all duration-150 active:scale-[0.98] ${
                    plan.recommended
                      ? 'bg-[#1814F3] hover:bg-[#1612D3] text-white shadow-sm'
                      : 'bg-white border border-[#E6EFF5] hover:bg-[#F5F7FA] text-[#232323]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-[#1814F3] rounded-2xl p-8 sm:p-12 text-white text-center flex flex-col items-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight max-w-2xl leading-tight">
            ¿Listo para llevar la gestión de tu empresa al siguiente nivel?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl">
            Comienza hoy tu prueba gratuita de 14 días. Configuración en minutos, sin tarjeta de crédito.
          </p>
          <Link
            href="/select"
            className="bg-white text-[#1814F3] hover:bg-slate-100 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-150 active:scale-[0.98] shadow-md"
          >
            Ingresar al Selector de Módulos
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
