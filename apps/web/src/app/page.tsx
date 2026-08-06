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
  { icon: Package, title: 'Inventario', description: 'Control completo de stock, trazabilidad por lote y serie, alertas de reorden automáticas.', color: 'from-slate-700 to-slate-900' },
  { icon: ShoppingCart, title: 'Ventas', description: 'Cotizaciones, órdenes de venta, facturación electrónica SII, despacho y seguimiento.', color: 'from-slate-700 to-slate-900' },
  { icon: Truck, title: 'Compras', description: 'Órdenes de compra, recepción, proveedores, facturas y notas de crédito.', color: 'from-slate-700 to-slate-900' },
  { icon: Users, title: 'CRM & Clientes', description: '360° del cliente, actividades, pipeline de ventas y segmentación avanzada.', color: 'from-slate-700 to-slate-900' },
  { icon: BarChart3, title: 'Contabilidad', description: 'Plan de cuentas, asientos automáticos, balance general y estados financieros.', color: 'from-slate-700 to-slate-900' },
  { icon: Briefcase, title: 'Proyectos', description: 'Gantt, Kanban, gestión de horas, presupuestos y plantillas reutilizables.', color: 'from-slate-700 to-slate-900' },
  { icon: Wallet, title: 'Nómina', description: 'Cálculo automático AFP, ISAPRE, licencias, finiquitos y boletas electrónicas.', color: 'from-slate-700 to-slate-900' },
  { icon: Calculator, title: 'Costos', description: 'Costeo FIFO, Kardex, márgenes por producto y análisis de rentabilidad.', color: 'from-slate-700 to-slate-900' },
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
    <div className="landing-page min-h-screen bg-card">
      {/* ─── 1. NAVBAR ─── */}
      <Navbar />

      {/* ─── 2. HERO ─── */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-card">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-grid opacity-[0.03]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-slate-600 mb-8 animate-fade-in-up">
            <Zap className="w-3.5 h-3.5" />
            Multi-tenant ERP para PyMEs chilenas
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            El ERP todo-en-uno
            <br />
            <span className="text-muted-foreground">para tu empresa</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Gestiona inventario, ventas, compras, contabilidad y más. Facturación electrónica SII, nómina chilena y multi-tenant nativo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/register"
              className="group rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-white transition-all duration-150 hover:bg-primary/90 active:scale-[0.98]"
            >
              Empezar Gratis — 14 días
              <ChevronRight className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#modules"
              className="group rounded-lg border border-border bg-card px-8 py-3.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted hover:border-slate-300"
            >
              Ver Módulos
              <ArrowRight className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span>SOC 2 Type II</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span>Encriptación AES-256</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span>SII Certificado</span>
            </div>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="relative rounded-xl border border-border bg-card shadow-xl shadow-slate-200/50 overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-muted">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="ml-4 text-xs text-muted-foreground">app.yellow-erp.cl/dashboard</div>
            </div>
            {/* Mock content */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-semibold text-foreground">Panel de Control</div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">Semana</span>
                  <span className="px-2.5 py-1 rounded-lg bg-primary text-white">Mes</span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Ventas Hoy', value: '$12.4M', change: '+12%' },
                  { label: 'Clientes', value: '1,247', change: '+5%' },
                  { label: 'Stock Items', value: '3,891', change: '-2%' },
                  { label: 'Órdenes', value: '89', change: '+18%' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-lg border border-slate-100 bg-card p-4">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-xl font-bold text-foreground mt-1">{kpi.value}</p>
                    <p className={`text-xs mt-1 ${kpi.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{kpi.change}</p>
                  </div>
                ))}
              </div>
              {/* Fake chart bars */}
              <div className="flex items-end gap-2 h-28">
                {[35, 55, 40, 70, 50, 85, 65, 95, 75, 60, 88, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-slate-200"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. STATS (count-up social proof) ─── */}
      <section className="py-16 px-4 sm:px-6 border-b border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10">
          <StatsCounter value={200} suffix="+" label="Empresas activas" />
          <StatsCounter value={10} suffix="k+" label="Usuarios gestionando" />
          <StatsCounter value={99.9} decimals={1} suffix="%" label="Disponibilidad" />
          <StatsCounter value={1} suffix="M+" label="Documentos emitidos" />
        </div>
      </section>

      {/* ─── 4. SOCIAL PROOF / LOGOS ─── */}
      <section className="py-12 border-b border-slate-100">
        <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-8">
          Powered by las mejores tecnologías
        </p>
        <Marquee speed={25} className="py-2">
          {logos.map((logo) => (
            <div
              key={logo}
              className="flex items-center justify-center px-6 py-3 text-sm font-bold text-slate-300 hover:text-muted-foreground transition-colors whitespace-nowrap"
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
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Módulos que se adaptan a tu negocio
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              12 módulos integrados que cubren toda la operación de una empresa chilena.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((mod) => (
              <div
                key={mod.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-150 hover:border-slate-300 hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-150">
                  <mod.icon className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors duration-150" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{mod.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. FEATURES ─── */}
      <section className="py-24 px-4 sm:px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Construido para Chile,
                <br />
                <span className="text-muted-foreground">diseñado para crecer</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Cada funcionalidad está pensada para la realidad de las empresas chilenas: desde la facturación electrónica con el SII hasta el cálculo automático de AFP e ISAPRE.
              </p>
              <div className="space-y-4">
                {features.map((f) => (
                  <div key={f.title} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Ingresos Mes', value: '$38.2M', change: '+22%' },
                    { label: 'Facturas', value: '312', change: '+9%' },
                    { label: 'Almacenes', value: '4', change: '+1' },
                    { label: 'Proveedores', value: '56', change: '+7%' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-lg border border-slate-100 p-4">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                      <p className="text-xl font-bold text-foreground mt-1">{kpi.value}</p>
                      <p className={`text-xs mt-1 ${kpi.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{kpi.change}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Empresas que confían en Yellow
            </h2>
            <p className="text-lg text-muted-foreground">
              Más de 200 empresas chilenas ya gestionan su operación con nosotros.
            </p>

            {/* Aggregate rating */}
            <div
              className="mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-card px-5 py-2.5"
              role="img"
              aria-label="Calificación promedio 4.9 de 5, más de 200 reseñas verificadas"
            >
              <Stars />
              <span className="text-sm font-semibold text-foreground">4.9/5</span>
              <span className="text-sm text-muted-foreground">· 200+ reseñas verificadas</span>
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
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Planes simples, sin sorpresas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Todos los planes incluyen 14 días de prueba gratis. Sin tarjeta de crédito.
            </p>
            <PricingToggle onToggle={() => {}} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-8 transition-all duration-150 ${
                  plan.popular
                    ? 'border-slate-900 bg-card shadow-lg'
                    : 'border-border bg-card hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
                    Más Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{formatPrice(plan.monthlyPrice)}</span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full text-center rounded-lg py-3 text-sm font-medium transition-all duration-150 ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'border border-border text-foreground hover:bg-muted'
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
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Resolvemos las dudas más comunes sobre Yellow ERP.
            </p>
          </div>
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* ─── 10. CTA ─── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-xl border border-border bg-card p-12 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Empieza a transformar tu empresa hoy
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              14 días de prueba gratis. Sin tarjeta de crédito. Configuración en minutos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-white transition-all duration-150 hover:bg-primary/90 active:scale-[0.98]"
              >
                Empezar Gratis
                <ChevronRight className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="mailto:hola@yellow-erp.cl"
                className="rounded-lg border border-border px-8 py-3.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted"
              >
                Hablar con Ventas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. FOOTER ─── */}
      <Footer />
    </div>
  );
}
