'use client';

import Link from 'next/link';
import {
  Package, ShoppingCart, Users, BarChart3, Shield, Settings,
  Truck, Calculator, Briefcase, ChevronRight, Check, Zap,
  Building2, FileText, Globe, Lock, Eye, ArrowRight,
  CreditCard, Wallet, TrendingUp, Bell
} from 'lucide-react';
import { Marquee } from '@/components/landing/Marquee';
import { AnimatedBadge } from '@/components/landing/AnimatedBadge';
import { GradientText } from '@/components/landing/GradientText';
import { TestimonialCard } from '@/components/landing/TestimonialCard';
import { FaqAccordion } from '@/components/landing/FaqAccordion';
import { PricingToggle } from '@/components/landing/PricingToggle';
import { StatsCounter } from '@/components/landing/StatsCounter';
import { Stars } from '@/components/landing/Stars';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';

const modules = [
  { icon: Package, title: 'Inventario', description: 'Control completo de stock, trazabilidad por lote y serie, alertas de reorden automáticas.', color: 'from-sky-500 to-blue-600' },
  { icon: ShoppingCart, title: 'Ventas', description: 'Cotizaciones, órdenes de venta, facturación electrónica SII, despacho y seguimiento.', color: 'from-blue-500 to-indigo-600' },
  { icon: Truck, title: 'Compras', description: 'Órdenes de compra, recepción, proveedores, facturas y notas de crédito.', color: 'from-indigo-500 to-violet-600' },
  { icon: Users, title: 'CRM & Clientes', description: '360° del cliente, actividades, pipeline de ventas y segmentación avanzada.', color: 'from-cyan-500 to-sky-600' },
  { icon: BarChart3, title: 'Contabilidad', description: 'Plan de cuentas, asientos automáticos, balance general y estados financieros.', color: 'from-blue-600 to-sky-600' },
  { icon: Briefcase, title: 'Proyectos', description: 'Gantt, Kanban, gestión de horas, presupuestos y plantillas reutilizables.', color: 'from-violet-500 to-indigo-600' },
  { icon: Wallet, title: 'Nómina', description: 'Cálculo automático AFP, ISAPRE, licencias, finiquitos y boletas electrónicas.', color: 'from-sky-600 to-blue-700' },
  { icon: Calculator, title: 'Costos', description: 'Costeo FIFO, Kardex, márgenes por producto y análisis de rentabilidad.', color: 'from-indigo-600 to-violet-600' },
];

const features = [
  { icon: Building2, title: 'Multi-tenant', description: 'Cada empresa tiene su espacio aislado con datos seguros y configuración independiente.' },
  { icon: Lock, title: 'RLS por Empresa', description: 'Row Level Security en Supabase garantiza que cada usuario solo vea sus datos.' },
  { icon: Zap, title: 'API RESTful', description: 'Endpoints REST con autenticación JWT, rate limiting y documentación OpenAPI.' },
  { icon: Globe, title: 'Chile First', description: 'RUT, facturación electrónica SII, AFP/ISAPRE, UF y normativa chilena nativa.' },
  { icon: Shield, title: 'Auditoría', description: 'Log completo de cambios con usuario, timestamp y diff de valores anteriores.' },
  { icon: Bell, title: 'Notificaciones', description: 'Alertas por email y en-app para vencimientos, stock bajo y aprobaciones.' },
];

const logos = [
  'SII', 'AFIP', 'SAP', 'Oracle', 'Microsoft', 'Google', 'AWS', 'Supabase',
  'Vercel', 'Tailwind', 'Next.js', 'TypeScript', 'PostgreSQL', 'Redis',
];

const testimonials = [
  { quote: 'Yellow ERP transformó nuestra operación. Pasamos de Excel a un sistema profesional en 2 semanas.', author: 'Carolina Muñoz', role: 'Gerente', company: 'TechSpa Ltda.' },
  { quote: 'La facturación electrónica con el SII funciona perfecto. Ahorramos 10 horas semanales en tareas manuales.', author: 'Rodrigo Fernández', role: 'Contador', company: 'Construcciones RF' },
  { quote: 'El módulo de inventario con trazabilidad por lote fue un cambio radical para nuestro agricultural.', author: 'María José Soto', role: 'Directora Ops', company: 'AgroSolutions' },
  { quote: 'Multi-tenant nos permitió consolidar 3 empresas en una sola plataforma. ROI en 3 meses.', author: 'Andrés Vega', role: 'CIO', company: 'Grupo Vega' },
  { quote: 'La integración con SII y el cálculo automático de nómina son excepcionales. Muy recomendado.', author: 'Patricia Lagos', role: 'Gerente General', company: 'Logística PL' },
];

const faqItems = [
  { question: '¿Cuánto tarda la implementación?', answer: 'Una empresa pequeña puede estar operativa en 1-2 semanas. Empresas medianas con personalización toman 4-6 semanas. Incluimos migración de datos y capacitación.' },
  { question: '¿Puedo migrar desde otro sistema?', answer: 'Sí. Importamos datos desde Excel, CSV, y otros ERPs. Nuestro equipo técnico se encarga de la migración sin pérdida de información.' },
  { question: '¿Funciona sin conexión a internet?', answer: 'Yellow ERP es 100% cloud. Sin embargo, el módulo POS tiene modo offline para funcionar temporalmente sin conexión y sincronizar después.' },
  { question: '¿Cómo es la facturación electrónica con el SII?', answer: 'Integramos directamente con el SII de Chile. Generas PDFs de boletas y facturas que cumplen con el 100% de la normativa vigente, incluyendo datos de receptores.' },
  { question: '¿Puedo personalizar los módulos?', answer: 'Sí. Cada módulo tiene configuración flexible. Para personalizaciones avanzadas, nuestro equipo de desarrollo puede adaptar funcionalidades específicas.' },
  { question: '¿Qué soporte ofrecen?', answer: 'Soporte por email, chat y teléfono en horario laboral. Planes Enterprise incluyen soporte 24/7 y un account manager dedicado.' },
];

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Para emprendedores y microempresas',
    monthlyPrice: 29900,
    features: [
      'Inventario + Ventas + Compras',
      'Facturación electrónica SII',
      'Hasta 3 usuarios',
      'Soporte por email',
      'Actualizaciones incluidas',
    ],
    cta: 'Empezar Gratis',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'Para PyMEs en crecimiento',
    monthlyPrice: 59900,
    features: [
      'Todos los módulos Starter',
      'Contabilidad + Nómina',
      'CRM + Proyectos',
      'Hasta 15 usuarios',
      'API acceso completo',
      'Soporte prioritario',
    ],
    cta: 'Comenzar Ahora',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Para empresas consolidadas',
    monthlyPrice: 99900,
    features: [
      'Todos los módulos Professional',
      'Multi-empresa',
      'Usuarios ilimitados',
      'SSO + 2FA',
      'SLA 99.9%',
      'Account manager dedicado',
      'Customizaciones incluidas',
    ],
    cta: 'Contactar Ventas',
    popular: false,
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price);
}

export default function HomePage() {
  return (
    <div className="landing-page min-h-screen bg-white dark:bg-slate-950">
      {/* ─── 1. NAVBAR ─── */}
      <Navbar />

      {/* ─── 2. HERO ─── */}
      <section className="relative pt-36 pb-28 overflow-hidden bg-slate-950">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-[0.15]" />
        {/* Ambient glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-r from-blue-600/25 via-indigo-600/20 to-sky-500/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-700/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-700/15 rounded-full blur-3xl" />
        {/* Fade to page bg */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-white dark:to-slate-950" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <AnimatedBadge
            icon={<Zap className="w-4 h-4" />}
            className="animate-fade-in-up mb-8"
          >
            Multi-tenant ERP para PyMEs chilenas
          </AnimatedBadge>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            El <GradientText className="text-gradient-dark">ERP todo-en-uno</GradientText>
            <br />
            para tu empresa
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Gestiona inventario, ventas, compras, contabilidad y más. Facturación electrónica SII, nómina chilena y multi-tenant nativo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/register"
              className="group relative overflow-hidden rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]"
            >
              Empezar Gratis — 14 días
              <ChevronRight className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#modules"
              className="group rounded-xl border border-slate-700 bg-slate-900/60 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-slate-800 hover:border-slate-600"
            >
              Ver Módulos
              <ArrowRight className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>SOC 2 Type II</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Encriptación AES-256</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>SII Certificado</span>
            </div>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-2xl shadow-blue-950/40 backdrop-blur-xl overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <div className="ml-4 text-xs text-slate-500">app.yellow-erp.cl/dashboard</div>
            </div>
            {/* Mock content */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-semibold text-slate-300">Panel de Control</div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">Semana</span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300">Mes</span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Ventas Hoy', value: '$12.4M', change: '+12%' },
                  { label: 'Clientes', value: '1,247', change: '+5%' },
                  { label: 'Stock Items', value: '3,891', change: '-2%' },
                  { label: 'Órdenes', value: '89', change: '+18%' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-xl font-bold text-white mt-1">{kpi.value}</p>
                    <p className={`text-xs mt-1 ${kpi.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{kpi.change}</p>
                  </div>
                ))}
              </div>
              {/* Fake chart bars */}
              <div className="flex items-end gap-2 h-32">
                {[35, 55, 40, 70, 50, 85, 65, 95, 75, 60, 88, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-600/70 to-sky-400/70"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Glow under mockup */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-blue-600/30 rounded-full blur-3xl" />
        </div>
      </section>

      {/* ─── 3. STATS (count-up social proof) ─── */}
      <section className="py-16 px-4 sm:px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10">
          <StatsCounter value={200} suffix="+" label="Empresas activas" />
          <StatsCounter value={10} suffix="k+" label="Usuarios gestionando" />
          <StatsCounter value={99.9} decimals={1} suffix="%" label="Disponibilidad" />
          <StatsCounter value={1} suffix="M+" label="Documentos emitidos" />
        </div>
      </section>

      {/* ─── 4. SOCIAL PROOF / LOGOS ─── */}
      <section className="py-12 border-b border-slate-100 dark:border-slate-800">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-8">
          Powered by las mejores tecnologías
        </p>
        <Marquee speed={25} className="py-2">
          {logos.map((logo) => (
            <div
              key={logo}
              className="flex items-center justify-center px-6 py-3 text-sm font-bold text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors whitespace-nowrap"
            >
              {logo}
            </div>
          ))}
        </Marquee>
      </section>

      {/* ─── 5. MODULES ─── */}
      <section id="modules" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Módulos que se adaptan a tu negocio
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              12 módulos integrados que cubren toda la operación de una empresa chilena.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((mod) => (
              <div
                key={mod.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4 shadow-sm`}>
                  <mod.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{mod.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{mod.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. FEATURES ─── */}
      <section className="py-24 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Construido para Chile,
                <br />
                <GradientText>diseñado para crecer</GradientText>
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Cada funcionalidad está pensada para la realidad de las empresas chilenas: desde la facturación electrónica con el SII hasta el cálculo automático de AFP e ISAPRE.
              </p>
              <div className="space-y-4">
                {features.map((f) => (
                  <div key={f.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-indigo-500/15 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Ingresos Mes', value: '$38.2M', change: '+22%' },
                    { label: 'Facturas', value: '312', change: '+9%' },
                    { label: 'Almacenes', value: '4', change: '+1' },
                    { label: 'Proveedores', value: '56', change: '+7%' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{kpi.value}</p>
                      <p className={`text-xs mt-1 ${kpi.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{kpi.change}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Eye className="w-4 h-4" />
                  <span>Vista previa del Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. TESTIMONIALS ─── */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Empresas que confían en Yellow
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Más de 200 empresas chilenas ya gestionan su operación con nosotros.
            </p>

            {/* Aggregate rating */}
            <div
              className="mt-6 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
              role="img"
              aria-label="Calificación promedio 4.9 de 5, más de 200 reseñas verificadas"
            >
              <Stars />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">4.9/5</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">· 200+ reseñas verificadas</span>
            </div>
          </div>
        </div>

        <Marquee speed={35} className="py-4">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </Marquee>

        <Marquee speed={40} reverse className="py-4">
          {[...testimonials].reverse().map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </Marquee>
      </section>

      {/* ─── 8. PRICING ─── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Planes simples, sin sorpresas
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Todos los planes incluyen 14 días de prueba gratis. Sin tarjeta de crédito.
            </p>
            <PricingToggle onToggle={() => {}} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? 'border-blue-300 bg-white shadow-xl dark:border-blue-500/50 dark:bg-slate-800'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-bold text-white shadow-sm">
                    Más Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{formatPrice(plan.monthlyPrice)}</span>
                  <span className="text-sm text-slate-400">/mes</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full text-center rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-slate-900 text-white hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. FAQ ─── */}
      <section id="faq" className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Resolvemos las dudas más comunes sobre Yellow ERP.
            </p>
          </div>
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* ─── 10. CTA ─── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-12 sm:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-[0.1]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-600/25 to-indigo-600/25 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Empieza a transformar tu empresa hoy
              </h2>
              <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
                14 días de prueba gratis. Sin tarjeta de crédito. Configuración en minutos.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="group rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]"
                >
                  Empezar Gratis
                  <ChevronRight className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="mailto:hola@yellow-erp.cl"
                  className="rounded-xl border border-slate-600 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/10"
                >
                  Hablar con Ventas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. FOOTER ─── */}
      <Footer />
    </div>
  );
}
