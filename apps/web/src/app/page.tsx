'use client';

import Link from 'next/link';
import {
  Package, ShoppingCart, Users, BarChart3, Shield, Settings,
  Truck, Calculator, Briefcase, ChevronRight, Check, Zap,
  Building2, FileText, Globe, Lock, Eye, ArrowRight, Star,
  CreditCard, Wallet, TrendingUp, Bell
} from 'lucide-react';
import { Marquee } from '@/components/landing/Marquee';
import { AnimatedBadge } from '@/components/landing/AnimatedBadge';
import { GradientText } from '@/components/landing/GradientText';
import { TestimonialCard } from '@/components/landing/TestimonialCard';
import { FaqAccordion } from '@/components/landing/FaqAccordion';
import { PricingToggle } from '@/components/landing/PricingToggle';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';

const modules = [
  { icon: Package, title: 'Inventario', description: 'Control completo de stock, trazabilidad por lote y serie, alertas de reorden automáticas.', color: 'from-blue-500 to-cyan-500' },
  { icon: ShoppingCart, title: 'Ventas', description: 'Cotizaciones, órdenes de venta, facturación electrónica SII, despacho y seguimiento.', color: 'from-emerald-500 to-teal-500' },
  { icon: Truck, title: 'Compras', description: 'Órdenes de compra, recepción, proveedores, facturas y notas de crédito.', color: 'from-violet-500 to-purple-500' },
  { icon: Users, title: 'CRM & Clientes', description: '360° del cliente, actividades, pipeline de ventas y segmentación avanzada.', color: 'from-rose-500 to-pink-500' },
  { icon: BarChart3, title: 'Contabilidad', description: 'Plan de cuentas, asientos automáticos, balance general y estados financieros.', color: 'from-amber-500 to-orange-500' },
  { icon: Briefcase, title: 'Proyectos', description: 'Gantt, Kanban, gestión de horas, presupuestos y plantillas reutilizables.', color: 'from-indigo-500 to-blue-500' },
  { icon: Wallet, title: 'Nómina', description: 'Cálculo automático AFP, ISAPRE, licencias, finiquitos y boletas electrónicas.', color: 'from-pink-500 to-rose-500' },
  { icon: Calculator, title: 'Costos', description: 'Costeo FIFO, Kardex, márgenes por producto y análisis de rentabilidad.', color: 'from-teal-500 to-emerald-500' },
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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* ─── 1. NAVBAR ─── */}
      <Navbar />

      {/* ─── 2. HERO ─── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-500/5 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-orange-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <AnimatedBadge
            icon={<Zap className="w-4 h-4" />}
            className="animate-fade-in-up mb-8"
          >
            Multi-tenant ERP para PyMEs chilenas
          </AnimatedBadge>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            El <GradientText>ERP todo-en-uno</GradientText>
            <br />
            para tu empresa
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Gestiona inventario, ventas, compras, contabilidad y más. Facturación electrónica SII, nómina chilena y multi-tenant nativo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/register"
              className="group relative overflow-hidden rounded-xl bg-slate-900 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-black hover:shadow-lg hover:shadow-slate-900/25 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Empezar Gratis — 14 días
              <ChevronRight className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#modules"
              className="group rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Ver Módulos
              <ArrowRight className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>SOC 2 Type II</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Encriptación AES-256</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>SII Certificado</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. SOCIAL PROOF / LOGOS ─── */}
      <section className="py-12 border-y border-slate-100 dark:border-slate-800">
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

      {/* ─── 4. MODULES ─── */}
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

      {/* ─── 5. FEATURES ─── */}
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
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
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
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Ventas Hoy', value: '$12.4M', change: '+12%' },
                    { label: 'Clientes', value: '1,247', change: '+5%' },
                    { label: 'Stock Items', value: '3,891', change: '-2%' },
                    { label: 'Órdenes', value: '89', change: '+18%' },
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

      {/* ─── 6. TESTIMONIALS ─── */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Empresas que confían en Yellow
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Más de 200 empresas chilenas ya gestionan su operación con nosotros.
            </p>
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

      {/* ─── 7. PRICING ─── */}
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
                    ? 'border-amber-300 bg-white shadow-xl dark:border-amber-500/50 dark:bg-slate-800'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1 text-xs font-bold text-white shadow-sm">
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

      {/* ─── 8. FAQ ─── */}
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

      {/* ─── 9. CTA ─── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-12 sm:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-full blur-3xl" />
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
                  className="group rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-4 text-base font-bold text-slate-900 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]"
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

      {/* ─── 10. FOOTER ─── */}
      <Footer />
    </div>
  );
}
