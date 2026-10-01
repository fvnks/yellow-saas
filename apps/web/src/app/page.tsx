'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Package, ShoppingCart, Users, BarChart3, Shield, Truck,
  Calculator, Briefcase, Check, ArrowRight, ChevronRight,
  Building2, Lock, Globe, Zap, Bell, Mail, MapPin, Phone,
  Send, CheckCircle2, Menu, X,
} from 'lucide-react';
import { Navbar } from '@/app/components/navbar';
import { Footer } from '@/app/components/footer';

const modules = [
  { icon: Package, title: 'Inventario', desc: 'Stock, bodegas y trazabilidad en tiempo real.' },
  { icon: ShoppingCart, title: 'Ventas', desc: 'Facturación electrónica SII integrada.' },
  { icon: Truck, title: 'Compras', desc: 'Órdenes, recepción y proveedores.' },
  { icon: Users, title: 'CRM', desc: 'Gestión de clientes y pipeline de ventas.' },
  { icon: BarChart3, title: 'Contabilidad', desc: 'Asientos automáticos y balances.' },
  { icon: Briefcase, title: 'Proyectos', desc: 'Gestión de proyectos y presupuestos.' },
  { icon: Calculator, title: 'Nómina', desc: 'Cálculo automát AFP, ISAPRE y Previred.' },
  { icon: Shield, title: 'Costos', desc: 'Costeo FIFO y márgenes por producto.' },
];

const features = [
  { icon: Building2, title: 'Multi-tenant', desc: 'Datos aislados por empresa con RLS.' },
  { icon: Lock, title: 'Seguridad', desc: 'Encriptación en tránsito y en reposo.' },
  { icon: Zap, title: 'API REST', desc: 'Endpoints documentados y escalables.' },
  { icon: Globe, title: 'Normativa Chilena', desc: 'SII, AFP, ISAPRE y leyes vigentes.' },
];

const testimonials = [
  {
    quote: 'Yellow ERP transformó nuestra gestión. Pasamos de Excel a todo centralizado con facturación SII automática.',
    author: 'María González',
    role: 'Gerente General',
    company: 'Distribuidora Sur SpA',
  },
  {
    quote: 'En dos semanas teníamos inventario, ventas y nómina funcionando. El módulo de costos FIFO nos ahorra horas.',
    author: 'Carlos Ruiz',
    role: 'Controller',
    company: 'TecnoAndes Ltda.',
  },
  {
    quote: 'La trazabilidad completa desde la orden de compra hasta la boleta electrónica. Cumplimos con el SII sin dolores.',
    author: 'Patricia Silva',
    role: 'Dueña',
    company: 'Comercial El Valle',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: 29900,
    desc: 'Para emprendedores y microempresas',
    features: ['Inventario + Ventas + Compras', 'Facturación SII ilimitada', 'Hasta 3 usuarios', 'Soporte por email'],
    cta: 'Empezar Gratis',
    popular: false,
  },
  {
    name: 'Professional',
    price: 59900,
    desc: 'Para PyMEs en expansión',
    features: ['Todos los módulos de Starter', 'Contabilidad + Nómina', 'CRM + Proyectos + Costos', 'Hasta 15 usuarios', 'Soporte prioritario 24/7'],
    cta: 'Probar Gratis',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99900,
    desc: 'Para grupos empresariales',
    features: ['Todos los módulos de Professional', 'Multi-empresa sin restricciones', 'Usuarios ilimitados', 'SSO + Auditoría avanzada', 'SLA 99.9%'],
    cta: 'Contactar Ventas',
    popular: false,
  },
];

const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

export default function HomePage() {
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
    <div className="min-h-screen bg-cloud text-ink">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-snow via-snow to-cloud" />
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-md border border-mist bg-snow/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-ink mb-6"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sunshine animate-pulse" />
              ERP SaaS · Hecho para PyMEs en Chile
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-light text-ink leading-[1.05] tracking-[-0.02em] mb-6"
            >
              El ERP que simplifica
              <br />
              <span className="text-sunshine-dark font-normal">toda tu empresa</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg text-slate-text max-w-xl mb-8 leading-relaxed"
            >
              Controla Inventario, Ventas, Compras, Contabilidad y Nómina chilena en una plataforma ágil, segura y adaptada al SII.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col sm:flex-row items-start gap-3"
            >
              <Link
                href="/es/register"
                className="w-full sm:w-auto rounded-[160px] bg-sunshine hover:bg-sunshine-hover text-ink px-8 py-3.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
              >
                Empezar Gratis — 14 Días
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="#modules"
                className="w-full sm:w-auto rounded-[160px] border border-mist bg-snow hover:bg-cloud text-ink px-8 py-3.5 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
              >
                Explorar Módulos
                <ArrowRight className="w-4 h-4 text-slate-text" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-text"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sunshine-dark" />
                <span>Multi-tenant Aislado</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sunshine-dark" />
                <span>Encriptación RLS</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sunshine-dark" />
                <span>Facturación SII Nativa</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-20 px-4 sm:px-6 bg-snow border-y border-mist">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
              Todo lo que tu empresa necesita
            </h2>
            <p className="text-sm sm:text-base text-slate-text max-w-2xl mx-auto">
              Módulos diseñados bajo la norma chilena con interfaz limpia, rápida e intuitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-cloud border border-mist rounded-2xl p-5 hover:border-fog hover:shadow-card transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-sunshine/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <mod.icon className="w-5 h-5 text-sunshine-dark" />
                </div>
                <h3 className="text-sm font-semibold text-ink mb-1">{mod.title}</h3>
                <p className="text-xs text-slate-text leading-relaxed">{mod.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-cloud">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-light text-ink mb-4 tracking-[-0.02em]">
                Construido para Chile,
                <br />
                <span className="text-sunshine-dark">preparado para escalar</span>
              </h2>
              <p className="text-sm text-slate-text mb-8 leading-relaxed">
                Nuestra plataforma fue estructurada desde el día uno para cumplir con las exigencias del SII y las leyes laborales chilenas.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((f) => (
                  <div key={f.title} className="bg-snow border border-mist rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-sunshine/10 rounded-lg flex items-center justify-center">
                        <f.icon className="w-4 h-4 text-sunshine-dark" />
                      </div>
                      <h3 className="text-xs font-semibold text-ink">{f.title}</h3>
                    </div>
                    <p className="text-[11px] text-slate-text leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-snow border border-mist rounded-3xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4 border-b border-mist pb-3">
                <span className="text-xs font-semibold text-ink">Control de Documentos SII</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold bg-mint/30 text-forest border border-mint/50">
                  Respuesta SII: 200 OK
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { doc: 'Factura Electrónica N° 4582', rut: '76.432.190-K', amount: '$4.590.000', status: 'Aceptado' },
                  { doc: 'Nota de Crédito N° 124', rut: '96.882.110-3', amount: '$320.000', status: 'Aceptado' },
                  { doc: 'Guía de Despacho N° 891', rut: '77.102.340-1', amount: '$1.250.000', status: 'En Tránsito' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-cloud border border-mist">
                    <div>
                      <p className="text-xs font-semibold text-ink">{item.doc}</p>
                      <p className="text-[10px] text-iron">RUT: {item.rut}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-ink">{item.amount}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold bg-mint/30 text-forest border border-mint/50">
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

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 bg-snow border-t border-mist">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
              Lo que dicen las PyMEs chilenas
            </h2>
            <p className="text-sm text-slate-text max-w-xl mx-auto">
              Más de 250 empresas confían en Yellow ERP para simplificar su operación diaria.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-cloud border border-mist rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <div key={idx} className="w-4 h-4 bg-sunshine rounded-sm" />
                  ))}
                </div>
                <p className="text-sm text-ink leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sunshine/10 flex items-center justify-center text-sunshine-dark font-bold text-sm">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.author}</p>
                    <p className="text-xs text-slate-text">{t.role}, {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-cloud border-t border-mist">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
              Planes claros y sin costos ocultos
            </h2>
            <p className="text-sm text-slate-text max-w-xl mx-auto mb-6">
              Comienza hoy con 14 días de prueba totalmente gratis. Cancela en cualquier momento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-snow rounded-2xl border p-6 transition-all duration-200 flex flex-col ${
                  plan.popular
                    ? 'border-sunshine shadow-card relative'
                    : 'border-mist hover:border-fog'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-[160px] bg-sunshine px-4 py-0.5 text-[10px] font-bold text-ink uppercase tracking-wider">
                    Recomendado
                  </div>
                )}
                <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
                <p className="text-xs text-slate-text mt-1 mb-5">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-ink">{clpFormatter.format(plan.price)}</span>
                  <span className="text-xs text-slate-text"> /mes + IVA</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-ink">
                      <Check className="w-4 h-4 text-sunshine-dark mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/es/register"
                  className={`block w-full text-center rounded-[160px] py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                    plan.popular
                      ? 'bg-sunshine text-ink hover:bg-sunshine-hover shadow-sm'
                      : 'bg-cloud border border-mist hover:bg-snow text-ink'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-snow border-t border-mist">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-cloud border border-mist rounded-3xl p-10 sm:p-14">
            <h2 className="text-3xl font-light text-ink mb-3 tracking-[-0.02em]">
              Toma el control total de tu empresa hoy
            </h2>
            <p className="text-sm text-slate-text mb-8 max-w-lg mx-auto">
              Únete a las más de 250 PyMEs en Chile que ahorran tiempo y automatizan sus procesos con Yellow ERP.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/es/register"
                className="w-full sm:w-auto rounded-[160px] bg-sunshine hover:bg-sunshine-hover text-ink px-8 py-3.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
              >
                Empezar Gratis
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="mailto:hola@yellow-erp.cl"
                className="w-full sm:w-auto rounded-[160px] border border-mist bg-snow hover:bg-cloud text-ink px-8 py-3.5 text-sm font-medium transition-all duration-150"
              >
                Agendar Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
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
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-snow border border-mist rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-ink mb-4">Información de contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-sunshine/10 text-sunshine-dark rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-iron uppercase tracking-wider">Email</p>
                      <a href="mailto:hola@yellow-erp.cl" className="text-sm font-medium text-ink hover:text-sunshine-dark transition-colors">hola@yellow-erp.cl</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-sunshine/10 text-sunshine-dark rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-iron uppercase tracking-wider">Teléfono</p>
                      <p className="text-sm font-medium text-ink">+56 2 2345 6789</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-sunshine/10 text-sunshine-dark rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-iron uppercase tracking-wider">Ubicación</p>
                      <p className="text-sm font-medium text-ink">Santiago, Chile</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-sunshine rounded-2xl p-6 text-ink">
                <div className="flex items-center gap-2 mb-3">
                  <Send className="w-4 h-4" />
                  <h3 className="text-sm font-bold">Ventas</h3>
                </div>
                <p className="text-xs text-ink/70 leading-relaxed mb-4">
                  ¿Quieres una demo personalizada o tienes preguntas sobre planes y precios? Escríbenos y te contactamos hoy mismo.
                </p>
                <a href="mailto:ventas@yellow-erp.cl" className="inline-flex items-center gap-2 bg-snow text-sunshine-dark px-4 py-2 rounded-[160px] text-xs font-semibold hover:bg-cloud transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  ventas@yellow-erp.cl
                </a>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-snow border border-mist rounded-2xl p-8">
                {contactSent ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-mint/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-forest" />
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-2">¡Mensaje enviado!</h3>
                    <p className="text-sm text-slate-text mb-6">Te responderemos dentro de 24 horas hábiles.</p>
                    <button
                      onClick={() => { setContactSent(false); setContactForm({ name: '', email: '', message: '' }); }}
                      className="text-sm font-semibold text-sunshine-dark hover:text-sunshine-hover transition-colors underline underline-offset-2"
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
                          className="w-full bg-cloud border border-mist rounded-md px-4 py-3 text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-sunshine/30 focus:border-sunshine transition-all"
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
                          className="w-full bg-cloud border border-mist rounded-md px-4 py-3 text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-sunshine/30 focus:border-sunshine transition-all"
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
                        className="w-full bg-cloud border border-mist rounded-md px-4 py-3 text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-sunshine/30 focus:border-sunshine transition-all resize-none"
                        placeholder="Cuéntanos en qué podemos ayudarte..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className="w-full bg-sunshine hover:bg-sunshine-hover text-ink px-6 py-3.5 rounded-[160px] text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-sm disabled:opacity-60"
                    >
                      {contactSubmitting ? (
                        <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar mensaje
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-iron text-center">
                      Al enviar aceptas nuestra{' '}
                      <Link href="/es/privacy" className="text-sunshine-dark hover:text-sunshine-hover underline underline-offset-2">Política de Privacidad</Link>.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
