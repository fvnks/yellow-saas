'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import {
  Users, Globe, Shield, BarChart3,
  Award, Heart, Settings, Mail, Phone, MapPin,
  Check, ArrowRight, CheckCircle2, ShoppingCart, Laptop
} from 'lucide-react';
import { StatsCounter } from '@/components/landing/StatsCounter';
import { SiteLiquidButton } from '@/components/landing/SiteLiquidButton';
import { Navbar } from '../(public)/components/navbar';
import { ContactForm } from '@/components/forms/ContactForm';

export default function DisenoWebPage() {
  const reduce = useReducedMotion();
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const handleContactSubmit = async (data: Record<string, string>) => {
    setContactSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source: 'diseno-web' }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message || 'No pudimos enviar tu mensaje.');
      }
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="landing-page min-h-screen bg-white text-ink">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:bg-white focus:text-ink focus:text-sm focus:font-semibold focus:px-4 focus:py-2 focus:rounded-lg focus:border focus:border-blue-600"
      >
        Saltar al contenido principal
      </a>

      <Navbar />

      <main id="contenido" tabIndex={-1} className="focus:outline-none">

        {/* HERO */}
        <section className="relative pt-20 pb-16 lg:pt-24 lg:pb-20 overflow-hidden bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="text-left">
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 180 }}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white/60 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-ink mb-6"
                >
                  Diseño Web Profesional · Sitios que Convierten
                </motion.div>

                <motion.h1
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 180, delay: 0.04 }}
                  className="text-4xl sm:text-5xl lg:text-[4rem] font-light text-ink leading-[1.05] tracking-[-0.04em] mb-5"
                >
                  Sitios web que no solo se ven bien,<br />sino que generan resultados reales
                </motion.h1>

                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 180, delay: 0.08 }}
                  className="text-base sm:text-lg text-gray-600 max-w-xl mb-8 leading-relaxed"
                >
                  Creamos sitios web a medida, optimizados para conversión, SEO y rendimiento.
                </motion.p>

                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 180, delay: 0.12 }}
                  className="flex flex-col sm:flex-row items-start gap-3"
                >
                  <SiteLiquidButton href="#contacto" variant="primary" className="w-full sm:w-auto">
                    <ArrowRight className="w-4 h-4" />
                    Solicitar Cotización
                  </SiteLiquidButton>
                  <SiteLiquidButton href="#servicios" variant="secondary" className="w-full sm:w-auto">
                    <span>Ver Nuestros Servicios</span>
                  </SiteLiquidButton>
                </motion.div>
              </div>

              <motion.div
                initial={reduce ? false : { opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 180, delay: 0.1 }}
                className="hidden lg:block"
              >
                <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://picsum.photos/seed/yellow-web-hero-dashboard/1200/800.jpg"
                    alt="Vista previa de dashboard web moderno diseñado por Yellow"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SERVICIOS */}
        <section id="servicios" className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3">Nuestros Servicios de Diseño Web</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Soluciones integrales para establecer y crecer tu presencia digital.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Laptop, title: 'Sitios Web Corporativos', desc: 'Páginas web profesionales con diseño responsive.', price: 'Desde $150.000 CLP' },
                { icon: ShoppingCart, title: 'E-commerce', desc: 'Tiendas en línea completas con carrito y pasarela de pago.', price: 'Desde $350.000 CLP' },
                { icon: Users, title: 'Portafolios', desc: 'Sitios personales para profesionales y freelancers.', price: 'Desde $120.000 CLP' },
                { icon: Settings, title: 'Aplicaciones Web', desc: 'Soluciones a medida con integraciones y APIs.', price: 'Desde $500.000 CLP' },
                { icon: BarChart3, title: 'SEO Optimizado', desc: 'Diseñados para posicionamiento en buscadores.', price: 'Desde $200.000 CLP' },
                { icon: Heart, title: 'Mantenimiento', desc: 'Planes continuos para tu sitio web.', price: 'Desde $30.000 CLP/mes' },
              ].map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-blue-50 border border-gray-200">
                      <s.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[18px] font-semibold text-ink mb-2">{s.title}</h3>
                      <p className="text-sm text-gray-600">{s.desc}</p>
                      <div className="mt-3 text-sm font-medium text-blue-600">{s.price}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PORTFOLIO */}
        <section id="portfolio" className="py-20 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3">Nuestro Trabajo</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Proyectos recientes que demuestran nuestra capacidad.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { alt: 'Sitio corporativo financiero', seed: 'yellow-web-financial', title: 'Sitio Corporativo Financiero' },
                { alt: 'E-commerce de moda', seed: 'yellow-web-ecommerce', title: 'E-commerce de Moda' },
                { alt: 'Portafolio fotográfico', seed: 'yellow-web-photography', title: 'Portafolio Fotográfico' },
                { alt: 'Sitio para restaurante', seed: 'yellow-web-restaurant', title: 'Sitio para Restaurante' },
              ].map((p, i) => (
                <motion.div
                  key={p.seed}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  <div className="relative aspect-video">
                    <Image
                      alt={p.alt}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      src={`https://picsum.photos/seed/${p.seed}/800/450.jpg`}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-[18px] font-semibold text-ink mb-2">{p.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTRACTO */}
        <section id="contacto" className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3">Contáctanos</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
                Cuéntanos sobre tu proyecto y te responderemos en 24 horas hábiles.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-ink mb-4">Información de contacto</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <a href="mailto:hola@yellow-erp.cl" className="text-sm font-medium hover:text-blue-600">hola@yellow-erp.cl</a>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">+56 9 1234 5678</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">Santiago, Chile</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="bg-white border border-gray-200 rounded-2xl p-8">
                  <ContactForm
                    onSubmit={handleContactSubmit}
                    source="diseno-web"
                    submitLabel="Enviar mensaje"
                    submitting={contactSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold">Yellow Web Design</span>
              </div>
              <p className="text-xs text-gray-600">Diseño web profesional para PyMEs chilenas.</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Yellow Web Design.</p>
            <div className="flex items-center gap-6 text-xs">
              <Link href="/privacy" className="hover:text-blue-600">Privacidad</Link>
              <Link href="/terms" className="hover:text-blue-600">Términos</Link>
              <Link href="/cookies" className="hover:text-blue-600">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
