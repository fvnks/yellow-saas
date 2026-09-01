'use client';

import Link from 'next/link';
import {
  Package, ShoppingCart, Users, BarChart3, Shield, Settings,
  Truck, Calculator, Briefcase, ChevronRight, Check, Zap,
  Building2, FileText, Globe, Lock, Eye, ArrowRight,
  CreditCard, Wallet, TrendingUp, Bell
} from 'lucide-react';
import { Marquee } from '@/components/landing/Marquee';
import { TestimonialCard } from '@/components/landing/TestimonialCard';
import { FaqAccordion } from '@/components/landing/FaqAccordion';
import { PricingToggle } from '@/components/landing/PricingToggle';
import { StatsCounter } from '@/components/landing/StatsCounter';
import { Stars } from '@/components/landing/Stars';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';

const modules = [
  { icon: Package, title: 'Inventario', description: 'Control completo de stock, trazabilidad por lote y serie, alertas de reorden automáticas.', iconBg: 'bg-blue-50 text-[#0F172A]' },
  { icon: ShoppingCart, title: 'Ventas', description: 'Cotizaciones, órdenes de venta, facturación electrónica SII, despacho y seguimiento.', iconBg: 'bg-[#FACC15]/15 text-[#00A896]' },
  { icon: Truck, title: 'Compras', description: 'Órdenes de compra, recepción, proveedores, facturas y notas de crédito.', iconBg: 'bg-amber-50 text-[#FACC15]' },
  { icon: Users, title: 'CRM & Clientes', description: '360° del cliente, actividades, pipeline de ventas y segmentación avanzada.', iconBg: 'bg-indigo-50 text-[#2D60FF]' },
  { icon: BarChart3, title: 'Contabilidad', description: 'Plan de cuentas, asientos automáticos, balance general y estados financieros.', iconBg: 'bg-[#FACC15]/15 text-[#FACC15]' },
  { icon: Briefcase, title: 'Proyectos', description: 'Gantt, Kanban, gestión de horas, presupuestos y plantillas reutilizables.', iconBg: 'bg-emerald-50 text-emerald-600' },
  { icon: Wallet, title: 'Nómina', description: 'Cálculo automático AFP, ISAPRE, licencias, finiquitos y boletas electrónicas.', iconBg: 'bg-purple-50 text-purple-600' },
  { icon: Calculator, title: 'Costos', description: 'Costeo FIFO, Kardex, márgenes por producto y análisis de rentabilidad.', iconBg: 'bg-cyan-50 text-cyan-600' },
];

const features = [
  { icon: Building2, title: 'Multi-tenant Nativo', description: 'Cada empresa tiene su espacio aislado con datos seguros y configuración independiente.', iconBg: 'bg-blue-50 text-[#0F172A]' },
  { icon: Lock, title: 'RLS por Empresa', description: 'Row Level Security en Supabase garantiza que cada usuario solo vea los datos de su empresa.', iconBg: 'bg-[#FACC15]/15 text-[#00A896]' },
  { icon: Zap, title: 'API RESTful Robusta', description: 'Endpoints REST con autenticación JWT, rate limiting y respuestas estructuradas en milisegundos.', iconBg: 'bg-amber-50 text-[#FACC15]' },
  { icon: Globe, title: 'Normativa Chilena Nativa', description: 'RUT, facturación electrónica SII, AFP/ISAPRE, UF y leyes vigentes en Chile.', iconBg: 'bg-indigo-50 text-[#2D60FF]' },
  { icon: Shield, title: 'Auditoría Completa', description: 'Log inmutable de cambios con usuario, timestamp y diff de valores anteriores.', iconBg: 'bg-[#FACC15]/15 text-[#FACC15]' },
  { icon: Bell, title: 'Notificaciones Inteligentes', description: 'Alertas inmediatas para vencimientos, stock bajo, facturas pendientes y aprobaciones.', iconBg: 'bg-purple-50 text-purple-600' },
];

const logos = [
  'SII Chile', 'Supabase', 'Next.js 14', 'TypeScript', 'Tailwind CSS', 'PostgreSQL',
  'Turborepo', 'Vercel', 'Docker', 'Redis', 'Lucide React', 'Framer Motion',
];

const testimonials = [
  { quote: 'Yellow ERP transformó nuestra operación. Pasamos de planillas Excel dispersas a un sistema unificado y veloz en 2 semanas.', author: 'Carolina Muñoz', role: 'Gerente General', company: 'TechSpa Ltda.' },
  { quote: 'La facturación electrónica con el SII es instantánea. Ahorramos más de 12 horas semanales en conciliación manual.', author: 'Rodrigo Fernández', role: 'Jefe Contable', company: 'Construcciones RF' },
  { quote: 'El módulo de inventario con trazabilidad por lote fue un cambio drástico para nuestra cadena de distribución.', author: 'María José Soto', role: 'Directora de Operaciones', company: 'AgroSolutions' },
  { quote: 'La arquitectura multi-tenant nos permitió consolidar 4 empresas del holding en una sola pantalla.', author: 'Andrés Vega', role: 'CIO', company: 'Grupo Vega Chile' },
  { quote: 'El soporte técnico y el cálculo automático de nómina chilena son simplemente impecables.', author: 'Patricia Lagos', role: 'Gerente de Administración', company: 'Logística PL' },
];

const faqItems = [
  { question: '¿Cuánto tarda la implementación inicial?', answer: 'Una PyME típica queda lista y operando en menos de 7 días. Incluimos asistentes de migración para cargar tus datos desde Excel o sistemas previos.' },
  { question: '¿Está 100% adaptado a la normativa chilena?', answer: 'Sí. Integra formato RUT, emisión de DTEs validados con el SII, UF/UTM, cálculo de cotizaciones previsionales (AFP, Fonasa, Isapre) e impuestos chilenos.' },
  { question: '¿Cómo funciona la seguridad multi-tenant?', answer: 'Utilizamos aislamiento estricto por `company_id` con políticas RLS (Row Level Security) directamente en la base de datos PostgreSQL, previniendo cualquier fuga de información.' },
  { question: '¿Puedo integrar Yellow ERP con mis propias aplicaciones?', answer: 'Absolutamente. Todas las funciones cuentan con APIs RESTful documentadas y autenticación mediante JWT de grado empresarial.' },
  { question: '¿Qué plan incluye el módulo de Facturación SII?', answer: 'Todos los planes (Starter, Professional y Enterprise) cuentan con emisión ilimitada de documentos tributarios electrónicos.' },
];

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Ideal para emprendedores y microempresas',
    monthlyPrice: 29900,
    features: [
      'Inventario + Ventas + Compras',
      'Facturación electrónica SII ilimitada',
      'Hasta 3 usuarios incluidos',
      'Multi-sucursal básica',
      'Soporte estándar por email',
    ],
    cta: 'Empezar 14 Días Gratis',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'La solución completa para PyMEs en expansión',
    monthlyPrice: 59900,
    features: [
      'Todos los módulos de Starter',
      'Contabilidad + Nómina Chilena',
      'CRM + Proyectos + Costos',
      'Hasta 15 usuarios incluidos',
      'Acceso completo a la API REST',
      'Soporte prioritario 24/7',
    ],
    cta: 'Probar Gratis Ahora',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Para grupos empresariales y holdings',
    monthlyPrice: 99900,
    features: [
      'Todos los módulos de Professional',
      'Multi-empresa sin restricciones',
      'Usuarios ilimitados',
      'SSO Enterprise + Auditoría avanz',
      'SLA garantizado 99.9%',
      'Account Manager dedicado',
    ],
    cta: 'Contactar a Ventas',
    popular: false,
  },
];

const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

function formatPrice(price: number) {
  return clpFormatter.format(price);
}

export default function HomePage() {
  return (
    <div className="landing-page min-h-screen bg-[#F1F5F9] text-[#0F172A]">
      {/* ─── 1. NAVBAR ─── */}
      <Navbar />

      {/* ─── 2. HERO ─── */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-white via-white to-[#F1F5F9]">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F1F5F9] px-4 py-1.5 text-xs font-semibold text-[#0F172A] mb-8 shadow-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FACC15] animate-pulse" />
            Modern Yellow ERP SaaS · Hecho para PyMEs en Chile
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-[1.15] tracking-tight mb-6">
            El ERP moderno que simplifica
            <br />
            <span className="text-[#0F172A]">toda tu empresa en un solo lugar</span>
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Controla tu Inventario, Ventas, Compras, Contabilidad y Nómina chilena en una plataforma ágil, segura y adaptada al SII.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white px-8 py-3.5 text-sm font-medium shadow-md shadow-[#0F172A]/25 transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Empezar Gratis — 14 Días</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="#modules"
              className="w-full sm:w-auto rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[#0F172A] px-8 py-3.5 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
            >
              <span>Explorar Módulos</span>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-[#64748B]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0F172A]" />
              <span>Multi-tenant Aislado</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FACC15]" />
              <span>Encriptación Supabase RLS</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FACC15]" />
              <span>Facturación SII 100% Nativa</span>
            </div>
          </div>
        </div>

        {/* Yellow ERP Interactive Preview Mockup */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 mt-14">
          <div className="relative bg-white border border-[#E2E8F0] rounded-2xl shadow-xl overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0] bg-white">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FACC15]" />
                <div className="w-3 h-3 rounded-full bg-[#FACC15]" />
                <div className="w-3 h-3 rounded-full bg-[#FACC15]" />
                <span className="ml-3 text-xs font-semibold text-[#64748B]">app.yellow-erp.cl/dashboard</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● En vivo
              </span>
            </div>

            {/* Mock Content */}
            <div className="p-6 bg-[#F1F5F9]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Resumen Operativo</h3>
                  <p className="text-xs text-[#64748B]">Empresa Demo Ltda. · Santiago, Chile</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] font-medium shadow-xs">
                    Este Mes
                  </span>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Ventas del Mes', value: '$24.850.000', change: '+18.4%', icon: ShoppingCart, bg: 'bg-blue-50 text-[#0F172A]' },
                  { label: 'Facturas Emitidas', value: '1.420 DTEs', change: '+8.2%', icon: FileText, bg: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Valor de Inventario', value: '$82.400.000', change: '+3.1%', icon: Package, bg: 'bg-amber-50 text-[#FACC15]' },
                  { label: 'Clientes Activos', value: '348', change: '+12%', icon: Users, bg: 'bg-indigo-50 text-[#2D60FF]' },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-4 hover:border-[#0F172A]/30 transition-all duration-150">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-wider">{kpi.label}</p>
                      <div className={`w-8 h-8 ${kpi.bg} rounded-full flex items-center justify-center`}>
                        <kpi.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-[#0F172A]">{kpi.value}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{kpi.change} vs mes anterior</p>
                  </div>
                ))}
              </div>

              {/* Yellow ERP Sample Bar Graph */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-semibold text-[#0F172A]">Flujo de Ingresos & Facturación</h4>
                  <span className="text-[10px] text-[#64748B]">Últimas 12 Semanas</span>
                </div>
                <div className="flex items-end gap-3 h-28 pt-4 border-b border-[#E2E8F0]">
                  {[45, 60, 52, 78, 65, 88, 70, 95, 82, 90, 100, 94].map((h, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <div
                        className="w-full bg-[#0F172A] rounded-t group-hover:bg-[#1E293B] transition-all duration-150"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. STATS ─── */}
      <section className="py-14 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <StatsCounter value={250} suffix="+" label="Empresas en Chile" />
          <StatsCounter value={12} suffix="k+" label="Usuarios diarios" />
          <StatsCounter value={99.9} decimals={1} suffix="%" label="Disponibilidad SLA" />
          <StatsCounter value={2} suffix="M+" label="DTEs SII procesados" />
        </div>
      </section>

      {/* ─── 4. LOGOS / MARQUEE ─── */}
      <section className="py-10 bg-[#F1F5F9] border-b border-[#E2E8F0]">
        <p className="text-center text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-6">
          Tecnología de Vanguardia e Integración Nativa
        </p>
        <Marquee speed={25} className="py-1">
          {logos.map((logo) => (
            <div
              key={logo}
              className="flex items-center justify-center px-6 py-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors whitespace-nowrap bg-white border border-[#E2E8F0] rounded-xl mx-2 shadow-xs"
            >
              {logo}
            </div>
          ))}
        </Marquee>
      </section>

      {/* ─── 5. MODULES ─── */}
      <section id="modules" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-[#0F172A] border border-blue-200 mb-3">
              MÓDULOS DE NEGOCIO
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">
              Todo lo que tu empresa necesita para crecer
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto">
              Módulos diseñados bajo la norma chilena con interfaz limpia, rápida e intuitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((mod) => (
              <div
                key={mod.title}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#0F172A]/30 transition-all duration-150 group"
              >
                <div className={`w-11 h-11 ${mod.iconBg} rounded-xl flex items-center justify-center mb-4 transition-transform duration-150 group-hover:scale-110`}>
                  <mod.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-1.5">{mod.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{mod.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. FEATURES ─── */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-[#F1F5F9]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                ARQUITECTURA DE ALTO NIVEL
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
                Construido para Chile,
                <br />
                <span className="text-[#0F172A]">preparado para escalar</span>
              </h2>
              <p className="text-sm text-[#64748B] mb-8 leading-relaxed">
                Nuestra plataforma fue estructurada desde el día uno para cumplir con las exigencias del Servicio de Impuestos Internos (SII) y las leyes laborales chilenas.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((f) => (
                  <div key={f.title} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 ${f.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <f.icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold text-[#0F172A]">{f.title}</h3>
                    </div>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Mockup Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4 border-b border-[#E2E8F0] pb-3">
                <span className="text-xs font-bold text-[#0F172A]">Control de Documentos SII</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Respuesta SII: 200 OK
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { doc: 'Factura Electrónica N° 4582', rut: '76.432.190-K', amount: '$4.590.000', status: 'Aceptado' },
                  { doc: 'Nota de Crédito N° 124', rut: '96.882.110-3', amount: '$320.000', status: 'Aceptado' },
                  { doc: 'Guía de Despacho N° 891', rut: '77.102.340-1', amount: '$1.250.000', status: 'En Tránsito' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A]">{item.doc}</p>
                      <p className="text-[10px] text-[#64748B]">RUT: {item.rut}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#0F172A]">{item.amount}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. TESTIMONIALS ─── */}
      <section className="py-20 bg-white overflow-hidden border-t border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10 text-center">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-3">
            TESTIMONIOS REALES
          </span>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-3">
            Confianza respaldada por líderes de la industria
          </h2>
          <div className="inline-flex items-center gap-3 rounded-full border border-[#E2E8F0] bg-[#F1F5F9] px-5 py-2">
            <Stars />
            <span className="text-xs font-bold text-[#0F172A]">4.9 / 5.0</span>
            <span className="text-xs text-[#64748B]">· Evaluado por más de 250 empresas</span>
          </div>
        </div>

        <Marquee speed={35} className="py-2">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </Marquee>
      </section>

      {/* ─── 8. PRICING ─── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-[#F1F5F9] border-t border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-[#0F172A] border border-blue-200 mb-3">
              PLANES TRANSPARENTES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">
              Planes claros y sin costos ocultos
            </h2>
            <p className="text-sm text-[#64748B] max-w-xl mx-auto mb-6">
              Comienza hoy con 14 días de prueba totalmente gratis. Cancela en cualquier momento.
            </p>
            <PricingToggle onToggle={() => {}} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border p-7 transition-all duration-150 flex flex-col justify-between ${
                  plan.popular
                    ? 'border-[#0F172A] shadow-lg shadow-[#0F172A]/10 relative'
                    : 'border-[#E2E8F0] shadow-sm hover:border-[#64748B]/40'
                }`}
              >
                <div>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0F172A] px-4 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      Recomendado
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-[#0F172A]">{plan.name}</h3>
                  <p className="text-xs text-[#64748B] mt-1 mb-5">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-[#0F172A]">{formatPrice(plan.monthlyPrice)}</span>
                    <span className="text-xs text-[#64748B]"> /mes + IVA</span>
                  </div>
                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-[#0F172A]">
                        <Check className="w-4 h-4 text-[#FACC15] mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/register"
                  className={`block w-full text-center rounded-xl py-3 text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                    plan.popular
                      ? 'bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-sm shadow-[#0F172A]/25'
                      : 'bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A]'
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
      <section id="faq" className="py-20 px-4 sm:px-6 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-3">
              PREGUNTAS FRECUENTES
            </span>
            <h2 className="text-3xl font-bold text-[#0F172A] mb-2">
              ¿Tienes dudas? Te ayudamos
            </h2>
            <p className="text-xs text-[#64748B]">
              Respuestas rápidas sobre la migración, facturación y soporte.
            </p>
          </div>
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* ─── 10. CTA ─── */}
      <section className="py-16 px-4 sm:px-6 bg-[#F1F5F9]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 sm:p-14 shadow-md">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-3">
              Toma el control total de tu empresa hoy
            </h2>
            <p className="text-sm text-[#64748B] mb-8 max-w-lg mx-auto">
              Únete a las más de 250 PyMEs en Chile que ahorran tiempo y automatizan sus procesos con Yellow ERP.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white px-8 py-3.5 text-sm font-medium shadow-md shadow-[#0F172A]/25 transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Crear Cuenta Gratis</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="mailto:hola@yellow-erp.cl"
                className="w-full sm:w-auto rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[#0F172A] px-8 py-3.5 text-sm font-medium transition-all duration-150"
              >
                Agendar Demo Personalizada
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
