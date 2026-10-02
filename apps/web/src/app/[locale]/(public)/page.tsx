'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'motion/react';
import { motion } from 'motion/react';
import {
 Package, ShoppingCart, Users, BarChart3, Shield,
 Truck, Calculator, Briefcase, ChevronRight, Check, Zap,
 Building2, Globe, Lock, ArrowRight,
 Wallet, Bell, Send, Mail, MapPin, Phone, CheckCircle2,
 Plus
} from 'lucide-react';
import { Marquee } from '@/components/landing/Marquee';
import { PricingToggle } from '@/components/landing/PricingToggle';
import { StatsCounter } from '@/components/landing/StatsCounter';
import { InteractiveDTEPipeline } from '@/components/landing/InteractiveDTEPipeline';
import { FaqAccordion } from '@/components/landing/FaqAccordion';

import { ComplianceCard } from '@/components/landing/ComplianceCard';
import { Navbar } from './components/navbar';

const modules = [
 { icon: Package, title: 'Inventario', description: 'Control completo de stock, trazabilidad por lote y serie, alertas de reorden automáticas.', iconBg: 'bg-sky-accent/30', iconColor: 'text-[#006680]' },
 { icon: ShoppingCart, title: 'Ventas', description: 'Cotizaciones, órdenes de venta, facturación electrónica SII, despacho y seguimiento.', iconBg: 'bg-periwinkle', iconColor: 'text-sunshine-ink' },
 { icon: Truck, title: 'Compras', description: 'Órdenes de compra, recepción, proveedores, facturas y notas de crédito.', iconBg: 'bg-apricot/15', iconColor: 'text-[#cc5500]' },
 { icon: Users, title: 'CRM & Clientes', description: '360° del cliente, actividades, pipeline de ventas y segmentación avanzada.', iconBg: 'bg-lavender', iconColor: 'text-[#8A6100]' },
 { icon: BarChart3, title: 'Contabilidad', description: 'Plan de cuentas, asientos automáticos, balance general y estados financieros.', iconBg: 'bg-mint/30', iconColor: 'text-forest' },
 { icon: Briefcase, title: 'Proyectos', description: 'Gantt, Kanban, gestión de horas, presupuestos y plantillas reutilizables.', iconBg: 'bg-cotton-candy/20', iconColor: 'text-[#8A6100]' },
 { icon: Wallet, title: 'Nómina', description: 'Cálculo automático AFP, ISAPRE, licencias, finiquitos y boletas electrónicas.', iconBg: 'bg-peony/40', iconColor: 'text-[#db2777]' },
 { icon: Calculator, title: 'Costos', description: 'Costeo FIFO, Kardex, márgenes por producto y análisis de rentabilidad.', iconBg: 'bg-aqua/30', iconColor: 'text-[#006680]' },
];

const features = [
 { icon: Building2, title: 'Multi-tenant Nativo', description: 'Cada empresa tiene su espacio aislado con datos seguros y configuración independiente.', iconBg: 'bg-sky-accent/30', iconColor: 'text-[#006680]' },
 { icon: Lock, title: 'RLS por Empresa', description: 'Row Level Security en Supabase garantiza que cada usuario solo vea los datos de su empresa.', iconBg: 'bg-mint/30', iconColor: 'text-forest' },
 { icon: Zap, title: 'API RESTful Robusta', description: 'Endpoints REST con autenticación JWT, rate limiting y respuestas estructuradas en milisegundos.', iconBg: 'bg-sunshine/10', iconColor: 'text-sunshine-ink' },
 { icon: Globe, title: 'Normativa Chilena Nativa', description: 'RUT, facturación electrónica SII, AFP/ISAPRE, UF y leyes vigentes en Chile.', iconBg: 'bg-apricot/15', iconColor: 'text-[#cc5500]' },
 { icon: Shield, title: 'Auditoría Completa', description: 'Log inmutable de cambios con usuario, timestamp y diff de valores anteriores.', iconBg: 'bg-lavender', iconColor: 'text-[#8A6100]' },
 { icon: Bell, title: 'Notificaciones Inteligentes', description: 'Alertas inmediatas para vencimientos, stock bajo, facturas pendientes y aprobaciones.', iconBg: 'bg-periwinkle', iconColor: 'text-sunshine-ink' },
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
 cta: 'Comenzar — 14 Días de Prueba',
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
 cta: 'Comenzar Ahora',
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
 'SSO Enterprise + Auditoría avanzada',
 'SLA garantizado 99.9%',
 'Account Manager dedicado',
 ],
 cta: 'Contactar a Ventas',
 popular: false,
 },
];

const logos = [
 'SII Chile', 'Supabase', 'Next.js 14', 'TypeScript', 'Tailwind CSS', 'PostgreSQL',
 'Turborepo', 'Vercel', 'Docker', 'Redis', 'Lucide React', 'Motion',
];

const faqItems = [
 {
 question: '¿Qué es un DTE y por qué me importa?',
 answer: 'Los Documentos Tributarios Electrónicos (facturas, boletas, notas de crédito y guías de despacho) son los documentos que el SII exige para operar en Chile. Yellow ERP los emite, valida y envía al SII automáticamente al momento de facturar, sin pasos manuales ni programas externos.',
 },
 {
 question: '¿Puedo probarlo sin tarjeta de crédito?',
 answer: 'Sí. Tienes 14 días de prueba con todos los módulos del plan Professional y no pedimos tarjeta para comenzar. Al terminar, decides si contratas o simplemente dejas de usarlo.',
 },
 {
 question: '¿Puedo importar mis datos desde otro sistema?',
 answer: 'Sí. Puedes importar tu inventario, clientes, proveedores y listas de precios desde planillas CSV, y nuestro equipo te acompaña en la carga inicial de saldos y documentos abiertos.',
 },
 {
 question: '¿Reemplaza a mi contador?',
 answer: 'No, lo potencia. Yellow ERP genera los asientos automáticos, libros contables electrónicos y estados financieros; tu contador revisa, valida y firma con la información siempre ordenada y actualizada.',
 },
 {
 question: '¿Cómo se facturan los precios?',
 answer: 'Los planes se facturan en pesos chilenos más IVA, mensual o anual (con 20% de descuento si eliges anual). Sin costos de implementación ni permanencia mínima: puedes cambiar de plan o cancelar cuando quieras.',
 },
 {
 question: '¿Qué pasa si el SII tiene una actualización tributaria?',
 answer: 'Actualizamos el motor de facturación y la normativa vigente por ti, sin costo adicional y sin que tengas que instalar nada. Los cambios de formularios y leyes chilenas quedan aplicados automáticamente.',
 },
];

const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

function formatPrice(price: number) {
 return clpFormatter.format(price);
}

export default function HomePage() {
 const reduce = useReducedMotion();
 const [yearly, setYearly] = useState(false);
 const [contactSent, setContactSent] = useState(false);
 const [contactForm, setContactForm] = useState({ name: '', email: '', message: '', website: '' });
 const [contactSubmitting, setContactSubmitting] = useState(false);
 const [contactError, setContactError] = useState<string | null>(null);
 const handleContactSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setContactSubmitting(true);
 setContactError(null);
 try {
 const res = await fetch('/api/contact', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ ...contactForm, source: 'landing' }),
 });
 const data = await res.json().catch(() => null);
 if (!res.ok || !data?.success) {
 throw new Error(data?.error?.message || 'No pudimos enviar tu mensaje. Escríbenos a hola@yellow-erp.cl');
 }
 setContactSent(true);
 } catch (err) {
 setContactError(err instanceof Error ? err.message : 'No pudimos enviar tu mensaje. Escríbenos a hola@yellow-erp.cl');
 } finally {
 setContactSubmitting(false);
 }
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
 <div className="text-left">
 <motion.div
 initial={reduce ? false : { opacity: 0, y: 14 }}
 animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
 transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0 }}
 className="inline-flex items-center gap-2 rounded-md border border-mist bg-snow/60 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-ink mb-6 shadow-xs"
 >
 <span className="inline-block w-2 h-2 rounded-full bg-sunshine animate-pulse" />
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
 className="w-full sm:w-auto rounded-[160px] bg-sunshine hover:bg-sunshine-hover text-white px-8 py-3.5 text-sm font-medium shadow-md transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
 >
 <Plus className="w-4 h-4" />
 Comenzar — 14 Días de Prueba
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
 <Shield className="w-4 h-4 text-sunshine-ink" />
 <span className="text-xs font-semibold text-ink">DTEs emitidos al SII</span>
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
 <StatsCounter value={2.4} decimals={1} suffix="M+" label="DTEs SII procesados" />
 </div>
 </section>

 {/* ─── 4. LOGOS / MARQUEE ─── */}
 <section className="py-10 bg-cloud border-b border-mist">
 <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-iron mb-5 px-4">
 Construido sobre tecnología probada
 </p>
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
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {modules.map((mod, i) => (
 <motion.div
 key={mod.title}
 initial={reduce ? false : { opacity: 0, y: 18 }}
 whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
 whileHover={reduce ? undefined : { y: -4 }}
 viewport={{ once: true, margin: '-40px' }}
 transition={{ type: 'spring', damping: 24, stiffness: 170, delay: (i % 4) * 0.06 }}
 className="group relative flex flex-col overflow-hidden rounded-3xl border border-mist bg-snow p-5 shadow-card transition-[border-color,box-shadow] duration-300 hover:border-fog hover:shadow-card-hover"
 >
 {/* Hairline de acento: crece desde la izquierda al hover */}
 <span
 aria-hidden="true"
 className={`absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 ${mod.iconColor} bg-current`}
 />
 {/* Wash del color del módulo en la esquina superior derecha */}
 <span
 aria-hidden="true"
 className={`pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70 ${mod.iconBg}`}
 />
 <div className="relative mb-4 flex items-start justify-between gap-3">
 <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-black/5 ${mod.iconBg}`}>
 <mod.icon className={`h-5 w-5 ${mod.iconColor}`} />
 </span>
 <span className="font-mono text-[11px] font-medium tabular-nums text-iron/70 transition-colors duration-300 group-hover:text-ink">
 {String(i + 1).padStart(2, '0')}
 </span>
 </div>
 <h3 className="relative mb-1.5 text-sm font-semibold tracking-[-0.01em] text-ink">{mod.title}</h3>
 <p className="relative text-[13px] leading-[1.6] text-slate-text">{mod.description}</p>
 </motion.div>
 ))}
 </div>
 </div>
 </section>

 {/* ─── 6. BENEFITS / FEATURES ─── */}
 <section id="features" className="py-20 px-4 sm:px-6 bg-cloud">
 <div className="max-w-[1200px] mx-auto">
 <div className="text-center mb-10">
 <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
 Por qué las PyMEs eligen Yellow ERP
 </h2>
 <p className="text-sm sm:text-base text-slate-text max-w-2xl mx-auto">
 Seguridad, cumplimiento y automatización desde el primer día, sin equipo técnico ni costos de implementación.
 </p>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {features.map((feature, i) => (
 <motion.div
 key={feature.title}
 initial={reduce ? false : { opacity: 0, y: 18 }}
 whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
 whileHover={reduce ? undefined : { y: -4 }}
 viewport={{ once: true, margin: '-40px' }}
 transition={{ type: 'spring', damping: 24, stiffness: 170, delay: (i % 3) * 0.06 }}
 className="group relative flex flex-col overflow-hidden rounded-3xl border border-mist bg-snow p-6 shadow-card transition-[border-color,box-shadow] duration-300 hover:border-fog hover:shadow-card-hover"
 >
 <span
 aria-hidden="true"
 className={`absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 ${feature.iconColor} bg-current`}
 />
 <span
 aria-hidden="true"
 className={`pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70 ${feature.iconBg}`}
 />
 <div className="relative mb-4 flex items-start justify-between gap-3">
 <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-black/5 ${feature.iconBg}`}>
 <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
 </span>
 <span className="font-mono text-[11px] font-medium tabular-nums text-iron/70 transition-colors duration-300 group-hover:text-ink">
 {String(i + 1).padStart(2, '0')}
 </span>
 </div>
 <h3 className="relative mb-1.5 text-sm font-semibold tracking-[-0.01em] text-ink">{feature.title}</h3>
 <p className="relative text-[13px] leading-[1.6] text-slate-text">{feature.description}</p>
 </motion.div>
 ))}
 </div>
 </div>
 </section>

 {/* ─── 7. CHILEAN COMPLIANCE DEEP-DIVE ─── */}
 <section id="compliance" className="py-20 px-4 sm:px-6 bg-snow border-y border-mist">
 <div className="max-w-[1200px] mx-auto">
 <div className="text-center mb-10">
 <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
 Cumplimiento chileno nativo, no adaptado
 </h2>
 <p className="text-sm text-slate-text max-w-xl mx-auto">
 Cada workflow está construido sobre la normativa tributaria y laboral vigente en Chile. Haz clic para ver la referencia legal exacta.
 </p>
 </div>
 <ComplianceCard reducedMotion={reduce ?? false} />
 </div>
 </section>

 {/* ─── 8. PRICING ─── */}
 <section id="pricing" className="py-20 px-4 sm:px-6 bg-cloud border-t border-mist">
 <div className="max-w-[1200px] mx-auto">
 <div className="text-center mb-12">
 <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
 Planes claros y sin costos ocultos
 </h2>
 <p className="text-sm text-slate-text max-w-xl mx-auto mb-6">
 Comienza hoy con 14 días de prueba de prueba. Cancela en cualquier momento.
 </p>
 <PricingToggle onToggle={setYearly} />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
 {pricingPlans.map((plan) => (
 <div
 key={plan.name}
 className={`bg-snow rounded-3xl border p-7 transition-all duration-200 flex flex-col justify-between ${
 plan.popular
 ? 'border-sunshine-dark shadow-card relative'
 : 'border-mist shadow-card hover:border-fog'
 }`}
 >
 <div>
 {plan.popular && (
 <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-[160px] bg-sunshine px-4 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
 Recomendado
 </div>
 )}
 <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
 <p className="text-xs text-slate-text mt-1 mb-5">{plan.description}</p>
 <div className="mb-6">
 <span className="text-3xl font-bold text-ink">
 {formatPrice(yearly ? plan.yearlyPrice : plan.monthlyPrice)}
 </span>
 <span className="text-xs text-slate-text"> /mes {yearly ? 'facturado anual' : '+ IVA'}</span>
 <span className="block text-[10px] text-sunshine-ink font-semibold mt-1">
 {yearly
 ? `Ahorras ${formatPrice(plan.monthlyPrice - plan.yearlyPrice)} /mes (-20%)`
 : `Anual: ${formatPrice(plan.yearlyPrice)} /mes (-20%)`}
 </span>
 </div>
 <ul className="space-y-2.5 mb-8">
 {plan.features.map((f) => (
 <li key={f} className="flex items-start gap-2.5 text-xs text-ink">
 <Check className="w-4 h-4 text-sunshine-ink mt-0.5 flex-shrink-0" />
 <span>{f}</span>
 </li>
 ))}
 </ul>
 </div>
 <Link
 href="/register"
 className={`block w-full text-center rounded-[160px] py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
 plan.popular
 ? 'bg-sunshine text-white hover:bg-sunshine-hover shadow-sm'
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

 {/* ─── 9. FAQ ─── */}
 <section id="faq" className="py-20 px-4 sm:px-6 bg-snow border-y border-mist">
 <div className="max-w-3xl mx-auto">
 <div className="text-center mb-10">
 <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
 Preguntas frecuentes
 </h2>
 <p className="text-sm text-slate-text max-w-xl mx-auto">
 Todo lo que necesitas saber antes de empezar tu prueba de 14 días.
 </p>
 </div>
 <FaqAccordion items={faqItems} />
 </div>
 </section>

 {/* ─── 10. CTA ─── */}
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
 className="w-full sm:w-auto rounded-[160px] bg-sunshine hover:bg-sunshine-hover text-white px-8 py-3.5 text-sm font-medium shadow-md transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
 >
 <span>Comenzar Ahora</span>
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

 {/* ─── 11. CONTACTO ─── */}
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
 <div className="w-9 h-9 bg-sunshine/10 text-sunshine-ink rounded-xl flex items-center justify-center flex-shrink-0">
 <Mail className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-semibold text-iron uppercase tracking-wider">Email</p>
 <a href="mailto:hola@yellow-erp.cl" className="text-sm font-medium text-ink hover:text-sunshine-ink transition-colors">hola@yellow-erp.cl</a>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="w-9 h-9 bg-sunshine/10 text-sunshine-ink rounded-xl flex items-center justify-center flex-shrink-0">
 <Phone className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-semibold text-iron uppercase tracking-wider">Teléfono</p>
 <p className="text-sm font-medium text-ink">+56 9 1234 5678</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="w-9 h-9 bg-sunshine/10 text-sunshine-ink rounded-xl flex items-center justify-center flex-shrink-0">
 <MapPin className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-semibold text-iron uppercase tracking-wider">Ubicación</p>
 <p className="text-sm font-medium text-ink">Santiago, Chile</p>
 </div>
 </div>
 </div>
 </div>
 <div className="bg-sunshine rounded-3xl p-6 text-ink">
 <div className="flex items-center gap-2 mb-3">
 <Send className="w-4 h-4 text-ink/70" />
 <h3 className="text-sm font-bold">Ventas</h3>
 </div>
 <p className="text-xs text-ink/75 leading-relaxed mb-4">
 ¿Quieres una demo personalizada o tienes preguntas sobre planes y precios? Escríbenos y te contactamos hoy mismo.
 </p>
 <a href="mailto:ventas@yellow-erp.cl" className="inline-flex items-center gap-2 bg-white text-sunshine-ink px-4 py-2 rounded-[160px] text-xs font-semibold hover:bg-cloud transition-colors">
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
 onClick={() => { setContactSent(false); setContactForm({ name: '', email: '', message: '', website: '' }); setContactError(null); }}
 className="text-sm font-semibold text-sunshine-ink hover:text-sunshine-ink-hover transition-colors underline underline-offset-2"
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
 className="w-full bg-cloud border border-mist rounded-md px-4 py-3 text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-sunshine-dark/20 focus:border-sunshine-dark transition-all"
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
 className="w-full bg-cloud border border-mist rounded-md px-4 py-3 text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-sunshine-dark/20 focus:border-sunshine-dark transition-all"
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
 className="w-full bg-cloud border border-mist rounded-md px-4 py-3 text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-sunshine-dark/20 focus:border-sunshine-dark transition-all resize-none"
 placeholder="Cuéntanos en qué podemos ayudarte..."
 />
 </div>
 {/* Honeypot antispam: oculto para humanos, visible para bots */}
 <input
 type="text"
 name="website"
 tabIndex={-1}
 autoComplete="off"
 aria-hidden="true"
 className="hidden"
 onChange={e => setContactForm({ ...contactForm, website: e.target.value })}
 />
 {contactError && (
 <p role="alert" className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
 {contactError}
 </p>
 )}
 <button
 type="submit"
 disabled={contactSubmitting}
 className="w-full bg-sunshine hover:bg-sunshine-hover text-white px-6 py-3.5 rounded-[160px] text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-sm disabled:opacity-60"
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
 <Link href="/privacy" className="text-sunshine-ink hover:text-sunshine-ink-hover underline underline-offset-2">Política de Privacidad</Link>.
 </p>
 </form>
 )}
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ─── 12. FOOTER WITH CHILEAN RESOURCES ─── */}
 <footer className="bg-snow border-t border-mist">
 <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
 <div className="lg:col-span-1">
 <Link href="/" className="inline-flex items-center gap-2 mb-4">
 <div className="w-8 h-8 rounded-xl bg-sunshine flex items-center justify-center">
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
 <li><Link href="/#modules" className="hover:text-sunshine-ink transition-colors">Inventario</Link></li>
 <li><Link href="/#modules" className="hover:text-sunshine-ink transition-colors">Ventas & DTE</Link></li>
 <li><Link href="/#modules" className="hover:text-sunshine-ink transition-colors">Compras</Link></li>
 <li><Link href="/#modules" className="hover:text-sunshine-ink transition-colors">Contabilidad</Link></li>
 <li><Link href="/#modules" className="hover:text-sunshine-ink transition-colors">Nómina</Link></li>
 <li><Link href="/#modules" className="hover:text-sunshine-ink transition-colors">Proyectos</Link></li>
 </ul>
 </div>
 <div>
 <h4 className="text-xs font-semibold text-iron uppercase tracking-wider mb-3">Empresa</h4>
 <ul className="space-y-2 text-sm text-slate-text">
 <li><Link href="/#pricing" className="hover:text-sunshine-ink transition-colors">Precios</Link></li>
 <li><Link href="/contact" className="hover:text-sunshine-ink transition-colors">Demo personalizada</Link></li>
 <li><Link href="/login" className="hover:text-sunshine-ink transition-colors">Iniciar Sesión</Link></li>
 <li><Link href="/register" className="hover:text-sunshine-ink transition-colors">Crear Cuenta</Link></li>
 </ul>
 </div>
 <div>
 <h4 className="text-xs font-semibold text-iron uppercase tracking-wider mb-3">Recursos Chile</h4>
 <ul className="space-y-2 text-sm text-slate-text">
 <li><a href="https://www.sii.cl" target="_blank" rel="noopener noreferrer" className="hover:text-sunshine-ink transition-colors">Portal SII</a></li>
 <li><a href="https://www.sii.cl/valores_y_fechas/uf/uf.htm" target="_blank" rel="noopener noreferrer" className="hover:text-sunshine-ink transition-colors">UF Hoy</a></li>
 <li><a href="https://www.previred.com" target="_blank" rel="noopener noreferrer" className="hover:text-sunshine-ink transition-colors">Previred</a></li>
 <li><a href="https://www.dt.gob.cl" target="_blank" rel="noopener noreferrer" className="hover:text-sunshine-ink transition-colors">Dirección del Trabajo</a></li>
 <li><a href="https://www.bcentral.cl" target="_blank" rel="noopener noreferrer" className="hover:text-sunshine-ink transition-colors">Banco Central</a></li>
 </ul>
 </div>
 </div>
 <div className="border-t border-mist pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
 <p className="text-xs text-iron">
 © {new Date().getFullYear()} Yellow ERP. Todos los derechos reservados.
 </p>
 <div className="flex items-center gap-6 text-xs text-iron">
 <Link href="/privacy" className="hover:text-sunshine-ink transition-colors">Privacidad</Link>
 <Link href="/terms" className="hover:text-sunshine-ink transition-colors">Términos</Link>
 <Link href="/cookies" className="hover:text-sunshine-ink transition-colors">Cookies</Link>
 </div>
 <div className="flex items-center gap-2 text-xs text-slate-text">
 <span>Actualizaciones tributarias quincenales →</span>
 <a href="mailto:newsletter@yellow-erp.cl" className="text-sunshine-ink hover:underline">Suscribirse</a>
 </div>
 </div>
 </div>
 </footer>
 </div>
 );
}