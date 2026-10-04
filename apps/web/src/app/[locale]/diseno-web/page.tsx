'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReducedMotion, motion } from 'motion/react';
import {
  Users, Brush, Globe, Laptop, Code, Shield, BarChart3, 
  Award, Heart, Settings, Send, Mail, Phone, MapPin,
  Check, ArrowRight, X, CheckCircle2, ShoppingCart
} from 'lucide-react';
import { PricingToggle } from '@/components/landing/PricingToggle';
import { StatsCounter } from '@/components/landing/StatsCounter';
import { SiteLiquidButton } from '@/components/landing/SiteLiquidButton';
import { Navbar } from '../(public)/components/navbar';

const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

function formatPrice(price: number) {
  return clpFormatter.format(price);
}

export default function DisenoWebPage() {
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
        body: JSON.stringify({ ...contactForm, source: 'diseno-web' }),
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
    <div className="landing-page min-h-screen bg-white text-ink">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:bg-white focus:text-ink focus:text-sm focus:font-semibold focus:px-4 focus:py-2 focus:rounded-lg focus:border focus:border-[#0369A1] focus:shadow-[0_0_0_2px_rgba(3,105,161,0.3)]"
      >
        Saltar al contenido principal
      </a>
      
      {/* ─── 1. NAVBAR ─── */}
      <Navbar />
      
      <main id="contenido" tabIndex={-1} className="focus:outline-none">
        
        {/* ─── 2. HERO ─── */}
        <section className="relative pt-20 pb-16 lg:pt-24 lg:pb-20 overflow-hidden bg-gradient-to-b from-white via-white to-gray-50">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Copy */}
              <div className="text-left">
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0 }}
                  className="inline-flex items-center gap-2 rounded-md border border-[#E2E8F0] bg-white/60 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-ink mb-6 shadow-xs"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Diseño Web Profesional · Sitios que Convierten
                </motion.div>
                
                <motion.h1
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0.04 }}
                  className="text-4xl sm:text-5xl lg:text-[4rem] font-light text-ink leading-[1.05] tracking-[-0.04em] mb-5"
                >
                  Sitios web que no solo se ven bien,
                  <br />
                  sino que generan resultados reales
                </motion.h1>
                
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0.08 }}
                  className="text-base sm:text-lg text-slate-text max-w-xl mb-8 leading-relaxed font-normal"
                >
                  Creamos sitios web a medida, optimizados para conversión, SEO y rendimiento. 
                  Desde páginas corporativas hasta plataformas de comercio electrónico, 
                  cada proyecto está diseñado pensando en tus objetivos de negocio.
                </motion.p>
                
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0.12 }}
                  className="flex flex-col sm:flex-row items-start gap-3"
                >
                  <SiteLiquidButton href="#contacto" variant="primary" className="w-full sm:w-auto">
                    <ArrowRight className="w-4 h-4" />
                    Solicitar Cotización
                  </SiteLiquidButton>
                  <SiteLiquidButton href="#servicios" variant="secondary" className="w-full sm:w-auto">
                    <span>Ver Nuestros Servicios</span>
                    <ArrowRight className="w-4 h-4 text-slate-text" />
                  </SiteLiquidButton>
                </motion.div>
                
                {/* Live trust counters */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0.16 }}
                  className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-ink">Proyectos entregados</span>
                    <span className="text-base font-bold text-ink font-mono">150+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-ink">Satisfacción garantizada</span>
                    <span className="text-base font-bold text-ink font-mono">98%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-accent" />
                    <span className="text-xs font-semibold text-ink">Clientes activos</span>
                    <span className="text-base font-bold text-ink font-mono">45+</span>
                  </div>
                </motion.div>
              </div>
              
              {/* Right: Visual */}
              <motion.div
                id="servicios"
                initial={reduce ? false : { opacity: 0, x: 32, scale: 0.94 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0.1 }}
                className="hidden lg:block"
              >
                <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-20" />
                  <div className="relative h-full w-full">
                    <Laptop className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-48 text-blue-600" />
                    <Brush className="absolute top-1/2 -translate-y-1/2 right-10 h-16 w-16 text-blue-400" />
                    <Code className="absolute bottom-10 left-10 w-24 h-16 text-blue-300" />
                    <Heart className="absolute bottom-10 right-10 w-16 h-16 text-red-500" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* ─── 3. SERVICIOS ─── */}
        <section id="servicios" className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
                Nuestros Servicios de Diseño Web
              </h2>
              <p className="text-sm sm:text-base text-slate-text max-w-2xl mx-auto">
                Soluciones integrales para establecer y crecer tu presencia digital con sitios web 
                profesionales, seguros y optimizados para resultados.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Servicio 1 */}
              <motion.div
                key="serv1"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#0369A1]/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-[#E2E8F0]/50">
                    <Laptop className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[18px] font-semibold text-ink mb-2">Sitios Web Corporativos</h3>
                    <p className="text-slate-text">
                      Páginas web profesionales que reflejan la identidad de tu marca, 
                      con diseño responsive y navegación intuitiva para una experiencia 
                      de usuario óptima en todos los dispositivos.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600">
                      <ArrowRight className="w-3 h-3" />
                      Desde $150.000 CLP
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Servicio 2 */}
              <motion.div
                key="serv2"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#0369A1]/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-[#E2E8F0]/50">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[18px] font-semibold text-ink mb-2">Plataformas de E-commerce</h3>
                    <p className="text-slate-text">
                      Tiendas en línea completas con carrito de compras, pasarelas de pago 
                      seguras, gestión de inventario y panel de administración fácil de usar.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600">
                      <ArrowRight className="w-3 h-3" />
                      Desde $350.000 CLP
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Servicio 3 */}
              <motion.div
                key="serv3"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.15 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#0369A1]/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-[#E2E8F0]/50">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[18px] font-semibold text-ink mb-2">Portafolios y Currículums</h3>
                    <p className="text-slate-text">
                      Sitios web personalizados para profesionales, artistas y freelancers 
                      que desean showcasing su trabajo y atraer nuevas oportunidades.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600">
                      <ArrowRight className="w-3 h-3" />
                      Desde $120.000 CLP
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Servicio 4 */}
              <motion.div
                key="serv4"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.2 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#0369A1]/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-[#E2E8F0]/50">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[18px] font-semibold text-ink mb-2">Aplicaciones Web Personalizadas</h3>
                    <p className="text-slate-text">
                      Soluciones web a medida para procesos de negocio específicos, 
                      con integraciones de bases de datos, APIs y funcionalidades avanzadas.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600">
                      <ArrowRight className="w-3 h-3" />
                      Desde $500.000 CLP
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Servicio 5 */}
              <motion.div
                key="serv5"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.25 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#0369A1]/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-[#E2E8F0]/50">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[18px] font-semibold text-ink mb-2">Sitios Optimizados para SEO</h3>
                    <p className="text-slate-text">
                      Diseñados desde la base para posicionamiento en buscadores, 
                      con estructura semántica, velocidad optimizada y metadata adecuada.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600">
                      <ArrowRight className="w-3 h-3" />
                      Desde $200.000 CLP
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Servicio 6 */}
              <motion.div
                key="serv6"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.3 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#0369A1]/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-[#E2E8F0]/50">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[18px] font-semibold text-ink mb-2">Mantenimiento y Soporte</h3>
                    <p className="text-slate-text">
                      Planes de mantenimiento continuo para asegurar que tu sitio web 
                      esté siempre actualizado, seguro y funcionando al máximo rendimiento.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600">
                      <ArrowRight className="w-3 h-3" />
                      Desde $30.000 CLP/mes
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* ─── 4. PORTFOLIO ─── */}
        <section id="portfolio" className="py-20 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
                Nuestro Trabajo
              </h2>
              <p className="text-sm sm:text-base text-slate-text max-w-2xl mx-auto">
                Proyectos recientes que demuestran nuestra capacidad para entregar 
                soluciones web efectivas y visualmente atractivas.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Portfolio Item 1 */}
              <motion.div
                key="port1"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    alt="Sitio web corporativo para empresa de servicios financieros"
                    className="object-cover w-full h-full"
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-[18px] font-semibold text-ink mb-2">Sitio Corporativo Financiero</h3>
                  <p className="text-slate-text text-sm">
                    Página web institucional con sección de servicios, blog y área de clientes
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                    <ArrowRight className="w-3 h-3" />
                    Ver proyecto
                  </div>
                </div>
              </motion.div>
              
              {/* Portfolio Item 2 */}
              <motion.div
                key="port2"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    alt="Tienda en línea para moda y accesorios"
                    className="object-cover w-full h-full"
                    src="https://images.unsplash.com/photo-1441986300917-646742611088?auto=format&fit=crop&w=800&q=60"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-[18px] font-semibold text-ink mb-2">E-commerce de Moda</h3>
                  <p className="text-slate-text text-sm">
                    Tienda online completa con catálogo de productos, carrito de compras y pasarela de pago integrada
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                    <ArrowRight className="w-3 h-3" />
                    Ver proyecto
                  </div>
                </div>
              </motion.div>
              
              {/* Portfolio Item 3 */}
              <motion.div
                key="port3"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.15 }}
                className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    alt="Portafolio personal de fotógrafo"
                    className="object-cover w-full h-full"
                    src="https://images.unsplash.com/photo-1523275335684-3788876b46c1?auto=format&fit=crop&w=800&q=60"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-[18px] font-semibold text-ink mb-2">Portafolio Fotográfico</h3>
                  <p className="text-slate-text text-sm">
                    Sitio personal para showcasing trabajo fotográfico con galería interactiva
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                    <ArrowRight className="w-3 h-3" />
                    Ver proyecto
                  </div>
                </div>
              </motion.div>
              
              {/* Portfolio Item 4 */}
              <motion.div
                key="port4"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.2 }}
                className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    alt="Sitio web para restaurante y delivery"
                    className="object-cover w-full h-full"
                    src="https://images.unsplash.com/photo-1517248135467-4c7edb34c457?auto=format&fit=crop&w=800&q=60"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-[18px] font-semibold text-ink mb-2">Sitio para Restaurante</h3>
                  <p className="text-slate-text text-sm">
                    Página web con menú interactivo, reservas online y pedido de delivery integrado
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                    <ArrowRight className="w-3 h-3" />
                    Ver proyecto
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* ─── 5. PROCESO ─── */}
        <section id="proceso" className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
                Nuestro Proceso de Trabajo
              </h2>
              <p className="text-sm sm:text-base text-slate-text max-w-2xl mx-auto">
                Un proceso claro y transparente para que sepas exactamente qué esperar 
                en cada etapa del proyecto.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Paso 1 */}
              <motion.div
                key="step1"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold mb-4">
                  1
                </div>
                <h3 className="text-[18px] font-semibold text-ink mb-2">Descubrimiento</h3>
                <p className="text-slate-text text-sm">
                  Nos reunimos contigo para entender tu negocio, objetivos y necesidades específicas. 
                  Analizamos tu competencia y definimos la estrategia digital.
                </p>
              </motion.div>
              
              {/* Paso 2 */}
              <motion.div
                key="step2"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold mb-4">
                  2
                </div>
                <h3 className="text-[18px] font-semibold text-ink mb-2">Diseño</h3>
                <p className="text-slate-text text-sm">
                  Creamos wireframes y prototipos de alta fidelidad para que visualices 
                  el sitio antes de la programación. Validamos contigo cada detalle.
                </p>
              </motion.div>
              
              {/* Paso 3 */}
              <motion.div
                key="step3"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.15 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold mb-4">
                  3
                </div>
                <h3 className="text-[18px] font-semibold text-ink mb-2">Desarrollo</h3>
                <p className="text-slate-text text-sm">
                  Programamos el sitio con tecnologías modernas y buenas prácticas, 
                  asegurando rendimiento, seguridad y compatibilidad con todos los dispositivos.
                </p>
              </motion.div>
              
              {/* Paso 4 */}
              <motion.div
                key="step4"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.2 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold mb-4">
                  4
                </div>
                <h3 className="text-[18px] font-semibold text-ink mb-2">Lanzamiento</h3>
                <p className="text-slate-text text-sm">
                  Publicamos tu sitio en producción y te capacitamos para que puedas 
                  gestionarlo fácilmente. También ofrecemos soporte continuo.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* ─── 6. PRECIOS ─── */}
        <section id="precios" className="py-20 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
                Planes y Precios
              </h2>
              <p className="text-sm sm:text-base text-slate-text max-w-2xl mx-auto">
                Opciones flexibles para cada presupuesto, desde sitios básicos hasta 
                soluciones empresariales completas.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Plan Básico */}
              <motion.div
                key="plan1"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6"
              >
                <h3 className="text-[18px] font-semibold text-ink mb-2">Sitio Básico</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-ink">$150.000</span>
                  <span className="text-sm text-slate-text"> / proyecto</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-text">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Hasta 5 páginas
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Diseño responsive
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Formulario de contacto
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Optimización SEO básica
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Hosting por 1 año
                  </li>
                </ul>
                <SiteLiquidButton href="#contacto" variant="secondary" className="w-full mt-6 py-3">
                  Solicitar presupuesto
                </SiteLiquidButton>
              </motion.div>
              
              {/* Plan Profesional */}
              <motion.div
                key="plan2"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="bg-white border-2 border-[#0369A1] rounded-2xl p-6 relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-[160px] bg-[#0369A1] px-4 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Recomendado
                </div>
                <h3 className="text-[18px] font-semibold text-ink mb-2">Sitio Profesional</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-ink">$350.000</span>
                  <span className="text-sm text-slate-text"> / proyecto</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-text">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Hasta 12 páginas
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Blog integrado
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Panel de administración
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    SEO avanzado
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Google Analytics
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Soporte por 3 meses
                  </li>
                </ul>
                <SiteLiquidButton href="#contacto" variant="primary" className="w-full mt-6 py-3">
                  Solicitar presupuesto
                </SiteLiquidButton>
              </motion.div>
              
              {/* Plan E-commerce */}
              <motion.div
                key="plan3"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.15 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6"
              >
                <h3 className="text-[18px] font-semibold text-ink mb-2">E-commerce</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-ink">$600.000</span>
                  <span className="text-sm text-slate-text"> / proyecto</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-text">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Tienda completa
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Carrito de compras
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Pasarelas de pago
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Gestión de inventario
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Panel de administración
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Soporte por 6 meses
                  </li>
                </ul>
                <SiteLiquidButton href="#contacto" variant="secondary" className="w-full mt-6 py-3">
                  Solicitar presupuesto
                </SiteLiquidButton>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* ─── 7. CTA ─── */}
        <section id="contacto" className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-[#E2E8F0] rounded-3xl p-10 sm:p-14">
              <h2 className="text-3xl font-light text-ink mb-3 tracking-[-0.02em]">
                ¿Listo para tener un sitio web profesional?
              </h2>
              <p className="text-sm text-slate-text mb-8 max-w-lg mx-auto">
                Cuéntanos sobre tu proyecto y te enviaremos una propuesta personalizada 
                dentro de las próximas 24 horas.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SiteLiquidButton href="#contacto" variant="primary" className="w-full sm:w-auto">
                  <ArrowRight className="w-4 h-4" />
                  Solicitar Cotización
                </SiteLiquidButton>
                <SiteLiquidButton href="mailto:hola@yellow-erp.cl" variant="secondary" className="w-full sm:w-auto">
                  Enviar Email Directo
                </SiteLiquidButton>
              </div>
            </div>
          </div>
        </section>
        
        {/* ─── 8. CONTACTO ─── */}
        <section id="contacto" className="py-20 px-4 sm:px-6 bg-white border-t border-[#E2E8F0]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-light text-ink mb-3 tracking-[-0.02em]">
                Contáctanos
              </h2>
              <p className="text-sm sm:text-base text-slate-text max-w-xl mx-auto">
                ¿Tienes un proyecto en mente? Nuestro equipo está listo para ayudarte.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              {/* Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-ink mb-4">Información de contacto</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-text uppercase tracking-wider">Email</p>
                        <a href="mailto:hola@yellow-erp.cl" className="text-sm font-medium text-ink hover:text-blue-600 transition-colors">hola@yellow-erp.cl</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-text uppercase tracking-wider">Teléfono</p>
                        <p className="text-sm font-medium text-ink">+56 9 1234 5678</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-text uppercase tracking-wider">Ubicación</p>
                        <p className="text-sm font-medium text-ink">Santiago, Chile</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Form */}
              <div className="lg:col-span-3">
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8">
                  {contactSent ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-ink mb-2">¡Mensaje enviado!</h3>
                      <p className="text-sm text-slate-text mb-6">Te responderemos dentro de 24 horas hábiles.</p>
                      <button
                        onClick={() => { setContactSent(false); setContactForm({ name: '', email: '', message: '', website: '' }); setContactError(null); }}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-2"
                      >
                        Enviar otro mensaje
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label htmlFor="contact-nombre" className="block text-xs font-semibold text-ink">Nombre *</label>
                          <input
                            id="contact-nombre"
                            name="name"
                            type="text"
                            required
                            autoComplete="name"
                            value={contactForm.name}
                            onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                            className="w-full bg-gray-50 border border-[#E2E8F0] rounded-md px-4 py-3 text-sm text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20 focus:border-[#0369A1] transition-all"
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="contact-email" className="block text-xs font-semibold text-ink">Correo electrónico *</label>
                          <input
                            id="contact-email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={contactForm.email}
                            onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                            className="w-full bg-gray-50 border border-[#E2E8F0] rounded-md px-4 py-3 text-sm text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20 focus:border-[#0369A1] transition-all"
                            placeholder="tu@empresa.cl"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="contact-mensaje" className="block text-xs font-semibold text-ink">Mensaje *</label>
                        <textarea
                          id="contact-mensaje"
                          name="message"
                          required
                          rows={5}
                          value={contactForm.message}
                          onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                          className="w-full bg-gray-50 border border-[#E2E8F0] rounded-md px-4 py-3 text-sm text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20 focus:border-[#0369A1] transition-all resize-none"
                          placeholder="Cuéntanos sobre tu proyecto web..."
                        />
                      </div>
                      {/* Honeypot antispam */}
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
                      <SiteLiquidButton
                        type="submit"
                        variant="primary"
                        disabled={contactSubmitting}
                        className="w-full px-6"
                      >
                        {contactSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Enviar mensaje
                          </>
                        )}
                      </SiteLiquidButton>
                      <p className="text-[10px] text-slate-text text-center">
                        Al enviar aceptas nuestra{' '}
                        <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">Política de Privacidad</Link>.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* ─── FOOTER ─── */}
      <footer className="bg-white border-t border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-ink">Yellow Web Design</span>
              </Link>
              <p className="text-xs text-slate-text leading-relaxed">
                Diseño web profesional para empresas chilenas. Sitios que convierten, seguros y optimizados.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-text uppercase tracking-wider mb-3">Servicios</h4>
              <ul className="space-y-2 text-sm text-slate-text">
                <li><Link href="/diseno-web#servicios" className="hover:text-blue-600 transition-colors">Sitios Web</Link></li>
                <li><Link href="/diseno-web#servicios" className="hover:text-blue-600 transition-colors">E-commerce</Link></li>
                <li><Link href="/diseno-web#servicios" className="hover:text-blue-600 transition-colors">SEO</Link></li>
                <li><Link href="/diseno-web#servicios" className="hover:text-blue-600 transition-colors">Mantenimiento</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-text uppercase tracking-wider mb-3">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-text">
                <li><Link href="/diseno-web#portfolio" className="hover:text-blue-600 transition-colors">Portfolio</Link></li>
                <li><Link href="/diseno-web#precios" className="hover:text-blue-600 transition-colors">Precios</Link></li>
                <li><Link href="/diseno-web#contacto" className="hover:text-blue-600 transition-colors">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-text uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-text">
                <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Términos</Link></li>
                <li><Link href="/cookies" className="hover:text-blue-600 transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#E2E8F0] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-text">
              © {new Date().getFullYear()} Yellow Web Design. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6 text-xs text-slate-text">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacidad</Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">Términos</Link>
              <Link href="/cookies" className="hover:text-blue-600 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}