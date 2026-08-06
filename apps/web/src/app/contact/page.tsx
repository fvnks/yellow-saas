'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft, Send, Mail, MapPin, Phone, MessageSquare, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate send
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-card">
      <nav className="fixed top-0 inset-x-0 bg-card/80 backdrop-blur-xl border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">Yellow ERP</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground">Contacto</h1>
            <p className="mt-3 text-muted-foreground">Tienes preguntas? Estamos aqui para ayudarte.</p>
          </div>

          <div className="grid gap-10 lg:grid-cols-5">
            {/* Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-muted border border-border rounded-xl p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4">Informacion de contacto</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Correo electronico</p>
                      <a href="mailto:hola@yellow-erp.cl" className="text-sm text-indigo-600 hover:text-indigo-500">hola@yellow-erp.cl</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Telefono</p>
                      <p className="text-sm text-slate-600">+56 9 1234 5678</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Direccion</p>
                      <p className="text-sm text-slate-600">Santiago, Chile</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted border border-border rounded-xl p-6">
                <h2 className="text-sm font-semibold text-foreground mb-3">Soporte tecnico</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Si eres cliente activo y tienes un problema tecnico, contacta a nuestro equipo
                  de soporte en{' '}
                  <a href="mailto:soporte@yellow-erp.cl" className="text-indigo-600 hover:text-indigo-500">soporte@yellow-erp.cl</a>{' '}
                  con tu numero de empresa para una respuesta prioritaria.
                </p>
              </div>

              <div className="bg-primary rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-semibold">Ventas</h2>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Quieres una demostracion personalizada o tienes preguntas sobre planes y precios?
                  Nuestro equipo de ventas puede ayudarte.
                </p>
                <a
                  href="mailto:ventas@yellow-erp.cl"
                  className="mt-4 inline-flex items-center gap-2 bg-card text-foreground px-4 py-2 rounded-lg text-xs font-medium hover:bg-muted transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  ventas@yellow-erp.cl
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-xl shadow-sm p-8">
                {sent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Mensaje enviado</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Te responderemos dentro de 24 horas habiles.</p>
                    <button
                      onClick={() => { setSent(false); setForm({ name: '', email: '', company: '', subject: '', message: '' }); }}
                      className="mt-6 text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-foreground">Nombre *</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-foreground">Correo electronico *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                          placeholder="tu@empresa.cl"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-foreground">Empresa</label>
                        <input
                          type="text"
                          value={form.company}
                          onChange={e => setForm({ ...form, company: e.target.value })}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                          placeholder="Nombre de tu empresa"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-foreground">Asunto *</label>
                        <select
                          required
                          value={form.subject}
                          onChange={e => setForm({ ...form, subject: e.target.value })}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="ventas">Consulta de ventas / Demo</option>
                          <option value="soporte">Soporte tecnico</option>
                          <option value="precios">Preguntas sobre precios</option>
                          <option value="partnership">Alianzas / Partners</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-foreground">Mensaje *</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent resize-none"
                        placeholder="Cuentanos en que podemos ayudarte..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar mensaje
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-muted-foreground text-center">
                      Al enviar aceptas nuestra{' '}
                      <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">Politica de Privacidad</Link>.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
