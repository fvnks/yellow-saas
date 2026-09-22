'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'motion/react';
import { motion } from 'motion/react';
import {
 Package, ShoppingCart, Users, BarChart3, Shield, Settings,
 Truck, Calculator, Briefcase, ChevronRight, Check, Zap,
 Building2, FileText, Globe, Lock, Eye, ArrowRight,
 CreditCard, Wallet, TrendingUp, Bell, Send, Mail, MapPin, Phone, CheckCircle2,
 Plus
} from 'lucide-react';
import { Marquee } from '@/components/landing/Marquee';
import { PricingToggle } from '@/components/landing/PricingToggle';
import { StatsCounter } from '@/components/landing/StatsCounter';
import { InteractiveDTEPipeline } from '@/components/landing/InteractiveDTEPipeline';
import { ModuleFlow } from '@/components/landing/ModuleFlow';
import { ComplianceCard } from '@/components/landing/ComplianceCard';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';

const modules = [
 { icon: Package, title: 'Inventario', description: 'Control completo de stock, trazabilidad por lote y serie, alertas de reorden automáticas.', iconBg: 'bg-sky-accent/30', iconColor: 'text-[#006680]' },
 { icon: ShoppingCart, title: 'Ventas', description: 'Cotizaciones, órdenes de venta, facturación electrónica SII, despacho y seguimiento.', iconBg: 'bg-periwinkle', iconColor: 'text-monday-violet' },
 { icon: Truck, title: 'Compras', description: 'Órdenes de compra, recepción, proveedores, facturas y notas de crédito.', iconBg: 'bg-apricot/15', iconColor: 'text-[#cc5500]' },
 { icon: Users, title: 'CRM & Clientes', description: '360° del cliente, actividades, pipeline de ventas y segmentación avanzada.', iconBg: 'bg-lavender', iconColor: 'text-[#7c3aed]' },
 { icon: BarChart3, title: 'Contabilidad', description: 'Plan de cuentas, asientos automáticos, balance general y estados financieros.', iconBg: 'bg-mint/30', iconColor: 'text-forest' },
 { icon: Briefcase, title: 'Proyectos', description: 'Gantt, Kanban, gestión de horas, presupuestos y plantillas reutilizables.', iconBg: 'bg-cotton-candy/20', iconColor: 'text-[#9333ea]' },
 { icon: Wallet, title: 'Nómina', description: 'Cálculo automático AFP, ISAPRE, licencias, finiquitos y boletas electrónicas.', iconBg: 'bg-peony/40', iconColor: 'text-[#db2777]' },
 { icon: Calculator, title: 'Costos', description: 'Costeo FIFO, Kardex, márgenes por producto y análisis de rentabilidad.', iconBg: 'bg-aqua/30', iconColor: 'text-[#006680]' },
];

const features = [
 { icon: Building2, title: 'Multi-tenant Nativo', description: 'Cada empresa tiene su espacio aislado con datos seguros y configuración independiente.', iconBg: 'bg-sky-accent/30', iconColor: 'text-[#006680]' },
 { icon: Lock, title: 'RLS por Empresa', description: 'Row Level Security en Supabase garantiza que cada usuario solo vea los datos de su empresa.', iconBg: 'bg-mint/30', iconColor: 'text-forest' },
 { icon: Zap, title: 'API RESTful Robusta', description: 'Endpoints REST con autenticación JWT, rate limiting y respuestas estructuradas en milisegundos.', iconBg: 'bg-monday-violet/10', iconColor: 'text-monday-violet' },
 { icon: Globe, title: 'Normativa Chilena Nativa', description: 'RUT, facturación electrónica SII, AFP/ISAPRE, UF y leyes vigentes en Chile.', iconBg: 'bg-apricot/15', iconColor: 'text-[#cc5500]' },
 { icon: Shield, title: 'Auditoría Completa', description: 'Log inmutable de cambios con usuario, timestamp y diff de valores anteriores.', iconBg: 'bg-lavender', iconColor: 'text-[#7c3aed]' },
 { icon: Bell, title: 'Notificaciones Inteligentes', description: 'Alertas inmediatas para vencimientos, stock bajo, facturas pendientes y aprobaciones.', iconBg: 'bg-periwinkle', iconColor: 'text-monday-violet' },
];

const pricingPlans = [
 {
 name: 'Starter',
 description: 'Ideal para emprendedores y microempresas',
 monthlyPrice: 29900,
 yearlyPrice: 23920,
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
 yearlyPrice: 47920,
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
 yearlyPrice: 79920,
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

const logos = [
 'SII Chile', 'Supabase', 'Next.js 14', 'TypeScript', 'Tailwind CSS', 'PostgreSQL',
 'Turborepo', 'Vercel', 'Docker', 'Redis', 'Lucide React', 'Framer Motion',
];

const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

function formatPrice(price: number) {
 return clpFormatter.format(price);
}

export default function HomePage() {
 const reduce = useReducedMotion();
 const [contactSent, setContactSent] = useState(false);
 const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
 const [contactSubmitting, setContactSubmitting] = useState(false);
 const handleContactSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setContactSubmitting(true);
 await new Promise(r => setTimeout(r, 900));
 setContactSubmitting(false);
 setContactSent(true);
 };
 return (
 <div className="landing-page min-h-screen bg-cloud text-ink">
 {/* ─── 1. NAVBAR ─── */}
 <Navbar />

 {/* ─── 2. HERO ─── */}
 <section className="relative pt-20 pb-16 lg:pt-24 lg:pb-20 overflow-hidden bg-gradient-to-b from-snow via-snow to-cloud">
 <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
 {/* Left: Copy */}
 <div className="text-left order-2 lg:order-1">
 <motion.div
 initial={reduce ? false : { opacity: 0, y: 14 }}
 animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
 transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0 }}
 className="inline-flex items-center gap-2 rounded-md border border-mist bg-snow/60 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-ink mb-6 shadow-xs"
 >
 <span className="inline-block w-2 h-2 rounded-full bg-monday-violet animate-pulse" />
 ERP SaaS · Hecho para PyMEs en Chile
 </motion.div>

 <motion.h1
 initial={reduce ? false : { opacity: 0, y: 14 }}
 animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
 transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0.04 }}
 className="text-4xl sm:text-5xl lg:text-[4rem] font-light text-ink leading-[1.05] tracking-[-0.04em] mb-5"
 >
 El ERP que emite facturas
 <br />
 mientras tú vendes
 </motion.h1>

 <motion.p
 initial={reduce ? false : { opacity: 0, y: 14 }}
 animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
 transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0.08 }}
 className="text-base sm:text-lg text-slate-text max-w-xl mb-8 leading-relaxed font-normal"
 >
 Inventario, Ventas, Compras, Contabilidad y Nómina chilena conectados. Emite DTEs al SII en segundos, no en horas.
 </motion.p>

 <motion.div
 initial={reduce ? false : { opacity: 0, y: 14 }}
 animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
 transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0.12 }}
 className="flex flex-col sm:flex-row items-start gap-3"
 >
 <Link
 href="/register"
 className="w-full sm:w-auto rounded-[160px] bg-monday-violet hover:bg-monday-violet-hover text-white px-8 py-3.5 text-sm font-medium shadow-md transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
 >
 <Plus className="w-4 h-4" />
 Empezar Gratis — 14 Días
 </Link>
 <Link
 href="#modules"
 className="w-full sm:w-auto rounded-[160px] border border-mist bg-snow hover:bg-cloud text-ink px-8 py-3.5 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
 >
 <span>Ver Demo Interactiva</span>
 <ArrowRight className="w-4 h-4 text-slate-text" />
 </Link>
 </motion.div>

 {/* Live trust counters */}
 <motion.div
 initial={reduce ? false : { opacity: 0, y: 14 }}
 animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
 transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0.16 }}
 className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3"
 >
 <div className="flex items-center gap-2">
 <Shield className="w-4 h-4 text-monday-violet" />
 <span className="text-xs font-semibold text-ink">DTEs procesados hoy</span>
 <span className="text-base font-bold text-ink font-mono">2.4M+</span>
 </div>
 <div className="flex items-center gap-2">
 <Lock className="w-4 h-4 text-forest" />
 <span className="text-xs font-semibold text-ink">Uptime SLA</span>
 <span className="text-base font-bold text-ink font-mono">99.9%</span>
 </div>
 <div className="flex items-center gap-2">
 <Globe className="w-4 h-4 text-sky-accent" />
 <span className="text-xs font-semibold text-ink">Empresas activas</span>
 <span className="text-base font-bold text-ink font-mono">250+</span>
 </div>
 </motion.div>
 </div>

 {/* Right: Interactive DTE Pipeline */}
 <motion.div
 className="order-1 lg:order-2"
 initial={reduce ? false : { opacity: 0, x: 32, scale: 0.94 }}
 animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
 transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0.1 }}
 >
 <InteractiveDTEPipeline />
 </motion.div>
 </div>
 </div>
 </section>

 {/* ─── 3. STATS ─── */}
 <section className="py-14 bg-snow border-y border-mist">
 <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
 <StatsCounter value={250} suffix="+" label="Empresas en Chile" />
 <StatsCounter value={12} suffix="k+" label="Usuarios diarios" />
 <StatsCounter value={99.9} decimals={1} suffix="%" label="Disponibilidad SLA" />
 <StatsCounter value={2} suffix="M+" label="DTEs SII procesados" />
 </div>
 </section>

 {/* ─── 4. LOGOS / MARQUEE ─── */}
 <section className="py-10 bg-cloud border-b border-mist">
 <Marquee speed={25} className="py-1">
 {logos.map((logo) => (
 <div
 key={logo}
 className="flex items-center justify-center px-6 py-2 text-xs font-bold text-iron hover:text-ink transition-colors whitespace-nowrap bg-snow border border-mist rounded-md mx-2 shadow-xs"
 >
 {logo}
 </div>
 ))}
 </Marquee>
 </section>

 {/* ─── 5. MODULE FLOW ─── */}
 <section id="modules" className="py-20 px-4 sm:px-6 bg-cloud">
 <div className="max-w-[1200px] mx-auto">
 <div className="text-center mb-10">
 <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
 Flujo de datos que conecta tu empresa
 </h2>
 <p className="text-sm sm:text-base text-slate-text max-w-2xl mx-auto">
 Cada módulo alimenta al siguiente. Ventas genera asientos contables, Contabilidad calcula nómina, Nómina actualiza inventario, Proyectos cierra el ciclo.
 </p>
 </div>
 <ModuleFlow reducedMotion={reduce ?? false} />
 </div>
 </section>

 {/* ─── 6. CHILEAN COMPLIANCE DEEP-DIVE ─── */}
 <section id="compliance" className="py-20 px-4 sm:px-6 bg-snow border-y border-mist">
 <div className="max-w-[1200px] mx-auto">
 <div className="text-center mb-10">
 <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
 Cumplimiento chileno nativo, no adaptado
 </h2>
 <p className="text-sm text-slate-text max-w-xl mx-auto">
 Cada workflow está construido sobre la normativa vigente 2024-2025. Haz clic para ver la referencia legal exacta.
 </p>
 </div>
 <ComplianceCard reducedMotion={reduce ?? false} />
 </div>
 </section>

 {/* ─── 7. PRICING ─── */}
 <section id="pricing" className="py-20 px-4 sm:px-6 bg-cloud border-t border-mist">
 <div className="max-w-[1200px] mx-auto">
 <div className="text-center mb-12">
 <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
 Planes claros y sin costos ocultos
 </h2>
 <p className="text-sm text-slate-text max-w-xl mx-auto mb-6">
 Comienza hoy con 14 días de prueba totalmente gratis. Cancela en cualquier momento.
 </p>
 <PricingToggle onToggle={() => {}} />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
 {pricingPlans.map((plan) => (
 <div
 key={plan.name}
 className={`bg-snow rounded-3xl border p-7 transition-all duration-200 flex flex-col justify-between ${
 plan.popular
 ? 'border-monday-violet shadow-card relative'
 : 'border-mist shadow-card hover:border-fog'
 }`}
 >
 <div>
 {plan.popular && (
 <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-[160px] bg-monday-violet px-4 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
 Recomendado
 </div>
 )}
 <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
 <p className="text-xs text-slate-text mt-1 mb-5">{plan.description}</p>
 <div className="mb-6">
 <span className="text-3xl font-bold text-ink">{formatPrice(plan.monthlyPrice)}</span>
 <span className="text-xs text-slate-text"> /mes + IVA</span>
 <span className="block text-[10px] text-monday-violet font-semibold mt-1">
 Anual: {formatPrice(plan.yearlyPrice)} /mes (-20%)
 </span>
 </div>
 <ul className="space-y-2.5 mb-8">
 {plan.features.map((f) => (
 <li key={f} className="flex items-start gap-2.5 text-xs text-ink">
 <Check className="w-4 h-4 text-monday-violet mt-0.5 flex-shrink-0" />
 <span>{f}</span>
 </li>
 ))}
 </ul>
 </div>
 <Link
 href="/register"
 className={`block w-full text-center rounded-[160px] py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
 plan.popular
 ? 'bg-monday-violet text-white hover:bg-monday-violet-hover shadow-sm'
 : 'bg-snow border border-mist hover:bg-cloud text-ink'
 }`}
 >
 {plan.cta}
 </Link>
 </div>
 ))}
 </div>
 <p className="text-center text-xs text-slate-text mt-6">
 Comparado con ERP tradicional: -70% costo, 0 setup, implementación en días no meses.
 </p>
 </div>
 </section>

 {/* ─── 8. CTA ─── */}
 <section className="py-16 px-4 sm:px-6 bg-cloud">
 <div className="max-w-4xl mx-auto text-center">
 <div className="bg-snow border border-mist rounded-3xl p-10 sm:p-14 shadow-card">
 <h2 className="text-3xl font-light text-ink mb-3 tracking-[-0.02em]">
 Toma el control total de tu empresa hoy
 </h2>
 <p className="text-sm text-slate-text mb-8 max-w-lg mx-auto">
 Únete a las más de 250 PyMEs en Chile que ahorran tiempo y automatizan sus procesos con Yellow ERP.
 </p>
 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
 <Link
 href="/register"
 className="w-full sm:w-auto rounded-[160px] bg-monday-violet hover:bg-monday-violet-hover text-white px-8 py-3.5 text-sm font-medium shadow-md transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
 >
 <span>Empezar Gratis</span>
 <ChevronRight className="w-4 h-4" />
 </Link>
 <Link
 href="mailto:hola@yellow-erp.cl"
 className="w-full sm:w-auto rounded-[160px] border border-mist bg-snow hover:bg-cloud text-ink px-8 py-3.5 text-sm font-medium transition-all duration-150"
 >
 Agendar Demo Personalizada
 </Link>
 </div>
 </div>
 </div>
 </section>

 {/* ─── 9. CONTACTO ─── */}
 <section id="contacto" className="py-20 px-4 sm:px-6 bg-cloud border-t border-mist">
 <div className="max-w-[1200px] mx-auto">
 <div className="text-center mb-12">
 <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
 Contáctanos
 </h2>
 <p className="text-sm text-slate-text max-w-xl mx-auto">
 ¿Tienes preguntas o quieres una demo personalizada? Nuestro equipo te responde en menos de 24 horas hábiles.
 </p>
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
 {/* Info */}
 <div className="lg:col-span-2 space-y-4">
 <div className="bg-snow border border-mist rounded-3xl p-6 shadow-card">
 <h3 className="text-sm font-semibold text-ink mb-4">Información de contacto</h3>
 <div className="space-y-4">
 <div className="flex items-start gap-3">
 <div className="w-9 h-9 bg-monday-violet/10 text-monday-violet rounded-xl flex items-center justify-center flex-shrink-0">
 <Mail className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-semibold text-iron uppercase tracking-wider">Email</p>
 <a href="mailto:hola@yellow-erp.cl" className="text-sm font-medium text-ink hover:text-monday-violet transition-colors">hola@yellow-erp.cl</a>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="w-9 h-9 bg-monday-violet/10 text-monday-violet rounded-xl flex items-center justify-center flex-shrink-0">
 <Phone className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-semibold text-iron uppercase tracking-wider">Teléfono</p>
 <p className="text-sm font-medium text-ink">+56 9 1234 5678</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="w-9 h-9 bg-monday-violet/10 text-monday-violet rounded-xl flex items-center justify-center flex-shrink-0">
 <MapPin className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-semibold text-iron uppercase tracking-wider">Ubicación</p>
 <p className="text-sm font-medium text-ink">Santiago, Chile</p>
 </div>
 </div>
 </div>
 </div>
 <div className="bg-monday-violet rounded-3xl p-6 text-white">
 <div className="flex items-center gap-2 mb-3">
 <Send className="w-4 h-4 text-white/80" />
 <h3 className="text-sm font-bold">Ventas</h3>
 </div>
 <p className="text-xs text-white/70 leading-relaxed mb-4">
 ¿Quieres una demo personalizada o tienes preguntas sobre planes y precios? Escríbenos y te contactamos hoy mismo.
 </p>
 <a href="mailto:ventas@yellow-erp.cl" className="inline-flex items-center gap-2 bg-white text-monday-violet px-4 py-2 rounded-[160px] text-xs font-semibold hover:bg-cloud transition-colors">
 <Mail className="w-3.5 h-3.5" />
 ventas@yellow-erp.cl
 </a>
 </div>
 </div>
 {/* Form */}
 <div className="lg:col-span-3">
 <div className="bg-snow border border-mist rounded-3xl shadow-card p-8">
 {contactSent ? (
 <div className="text-center py-10">
 <div className="w-16 h-16 bg-mint/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
 <CheckCircle2 className="w-8 h-8 text-forest" />
 </div>
 <h3 className="text-xl font-bold text-ink mb-2">¡Mensaje enviado!</h3>
 <p className="text-sm text-slate-text mb-6">Te responderemos dentro de 24 horas hábiles.</p>
 <button
 onClick={() => { setContactSent(false); setContactForm({ name: '', email: '', message: '' }); }}
 className="text-sm font-semibold text-monday-violet hover:text-monday-violet-hover transition-colors underline underline-offset-2"
 >
 Enviar otro mensaje
 </button>
 </div>
 ) : (
 <form onSubmit={handleContactSubmit} className="space-y-5">
 <div className="grid gap-5 sm:grid-cols-2">
 <div className="space-y-1.5">
 <label className="block text-xs font-semibold text-ink">Nombre *</label>
 <input
 type="text"
 required
 value={contactForm.name}
 onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
 className="w-full bg-cloud border border-mist rounded-md px-4 py-3 text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-monday-violet/20 focus:border-monday-violet transition-all"
 placeholder="Tu nombre"
 />
 </div>
 <div className="space-y-1.5">
 <label className="block text-xs font-semibold text-ink">Correo electrónico *</label>
 <input
 type="email"
 required
 value={contactForm.email}
 onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
 className="w-full bg-cloud border border-mist rounded-md px-4 py-3 text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-monday-violet/20 focus:border-monday-violet transition-all"
 placeholder="tu@empresa.cl"
 />
 </div>
 </div>
 <div className="space-y-1.5">
 <label className="block text-xs font-semibold text-ink">Mensaje *</label>
 <textarea
 required
 rows={5}
 value={contactForm.message}
 onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
 className="w-full bg-cloud border border-mist rounded-md px-4 py-3 text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-monday-violet/20 focus:border-monday-violet transition-all resize-none"
 placeholder="Cuéntanos en qué podemos ayudarte..."
 />
 </div>
 <button
 type="submit"
 disabled={contactSubmitting}
 className="w-full bg-monday-violet hover:bg-monday-violet-hover text-white px-6 py-3.5 rounded-[160px] text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-sm disabled:opacity-60"
 >
 {contactSubmitting ? (
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <>
 <Send className="w-4 h-4" />
 Enviar mensaje
 </>
 )}
 </button>
 <p className="text-[10px] text-iron text-center">
 Al enviar aceptas nuestra{' '}
 <Link href="/privacy" className="text-monday-violet hover:text-monday-violet-hover underline underline-offset-2">Política de Privacidad</Link>.
 </p>
 </form>
 )}
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ─── 10. FOOTER WITH CHILEAN RESOURCES ─── */}
 <footer className="bg-snow border-t border-mist">
 <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
 <div className="lg:col-span-1">
 <Link href="/" className="inline-flex items-center gap-2 mb-4">
 <div className="w-8 h-8 rounded-xl bg-monday-violet flex items-center justify-center">
 <Zap className="w-5 h-5 text-white" />
 </div>
 <span className="text-sm font-bold text-ink">Yellow ERP</span>
 </Link>
 <p className="text-xs text-slate-text leading-relaxed">
 ERP SaaS multi-tenant para PyMEs chilenas. Cumplimiento SII, AFP, UF nativo.
 </p>
 </div>
 <div>
 <h4 className="text-xs font-semibold text-iron uppercase tracking-wider mb-3">Módulos</h4>
 <ul className="space-y-2 text-sm text-slate-text">
 <li><Link href="/dashboard/inventory" className="hover:text-monday-violet transition-colors">Inventario</Link></li>
 <li><Link href="/dashboard/sales" className="hover:text-monday-violet transition-colors">Ventas & DTE</Link></li>
 <li><Link href="/dashboard/purchases" className="hover:text-monday-violet transition-colors">Compras</Link></li>
 <li><Link href="/dashboard/accounting" className="hover:text-monday-violet transition-colors">Contabilidad</Link></li>
 <li><Link href="/dashboard/payroll" className="hover:text-monday-violet transition-colors">Nómina</Link></li>
 <li><Link href="/dashboard/projects" className="hover:text-monday-violet transition-colors">Proyectos</Link></li>
 </ul>
 </div>
 <div>
 <h4 className="text-xs font-semibold text-iron uppercase tracking-wider mb-3">Empresa</h4>
 <ul className="space-y-2 text-sm text-slate-text">
 <li><Link href="/pricing" className="hover:text-monday-violet transition-colors">Precios</Link></li>
 <li><Link href="/about" className="hover:text-monday-violet transition-colors">Nosotros</Link></li>
 <li><Link href="/blog" className="hover:text-monday-violet transition-colors">Blog</Link></li>
 <li><Link href="/careers" className="hover:text-monday-violet transition-colors">Empleos</Link></li>
 <li><Link href="/contact" className="hover:text-monday-violet transition-colors">Contacto</Link></li>
 </ul>
 </div>
 <div>
 <h4 className="text-xs font-semibold text-iron uppercase tracking-wider mb-3">Recursos Chile</h4>
 <ul className="space-y-2 text-sm text-slate-text">
 <li><a href="https://www.sii.cl" target="_blank" rel="noopener noreferrer" className="hover:text-monday-violet transition-colors">Portal SII</a></li>
 <li><a href="https://www.sii.cl/valores_y_fechas/uf/uf.htm" target="_blank" rel="noopener noreferrer" className="hover:text-monday-violet transition-colors">UF Hoy</a></li>
 <li><a href="https://www.previred.com" target="_blank" rel="noopener noreferrer" className="hover:text-monday-violet transition-colors">Previred</a></li>
 <li><a href="https://www.dt.gob.cl" target="_blank" rel="noopener noreferrer" className="hover:text-monday-violet transition-colors">Dirección del Trabajo</a></li>
 <li><a href="https://www.bcentral.cl" target="_blank" rel="noopener noreferrer" className="hover:text-monday-violet transition-colors">Banco Central</a></li>
 </ul>
 </div>
 </div>
 <div className="border-t border-mist pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
 <p className="text-xs text-iron">
 © {new Date().getFullYear()} Yellow ERP. Todos los derechos reservados.
 </p>
 <div className="flex items-center gap-6 text-xs text-iron">
 <Link href="/privacy" className="hover:text-monday-violet transition-colors">Privacidad</Link>
 <Link href="/terms" className="hover:text-monday-violet transition-colors">Términos</Link>
 <Link href="/cookies" className="hover:text-monday-violet transition-colors">Cookies</Link>
 </div>
 <div className="flex items-center gap-2 text-xs text-slate-text">
 <span>Actualizaciones tributarias quincenales →</span>
 <a href="mailto:newsletter@yellow-erp.cl" className="text-monday-violet hover:underline">Suscribirse</a>
 </div>
 </div>
 </div>
 </footer>
 </div>
 );
}