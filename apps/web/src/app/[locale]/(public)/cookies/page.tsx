'use client';

import Link from 'next/link';
import { Building2, ArrowLeft, Cookie, Shield, BarChart3, Settings } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-cloud">
      <nav className="fixed top-0 inset-x-0 bg-snow/80 backdrop-blur-xl border-b border-mist z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-monday-violet rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-ink">Yellow ERP</span>
          </Link>
          <Link href="/" className="text-sm text-slate-text hover:text-ink flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-sunshine/10 rounded-xl flex items-center justify-center">
              <Cookie className="w-5 h-5 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-ink">Política de Cookies</h1>
          </div>
          <p className="mt-2 text-sm text-slate-text">Última actualización: Enero 2025</p>

          <div className="mt-10 space-y-8 text-sm text-ink leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-ink mb-2">1. ¿Qué son las Cookies?</h2>
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en su dispositivo
                cuando visita un sitio web. Se utilizan ampliamente para hacer que los sitios
                web funcionen de manera más eficiente, así como para proporcionar información
                a los propietarios del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">2. Cookies que Utilizamos</h2>
              <p>Utilizamos los siguientes tipos de cookies:</p>
              <div className="mt-4 space-y-3">
                <div className="bg-snow border border-mist rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-forest" />
                    <h3 className="text-sm font-semibold text-ink">Cookies Esenciales</h3>
                  </div>
                  <p className="text-xs text-slate-text">
                    Necesarias para el funcionamiento del servicio. Incluyen autenticación,
                    seguridad y preferencias de sesión. No pueden ser desactivadas.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-mint/30 text-forest text-[10px] font-mono">auth-token</span>
                    <span className="px-2 py-0.5 rounded-md bg-mint/30 text-forest text-[10px] font-mono">yellow-profile</span>
                    <span className="px-2 py-0.5 rounded-md bg-mint/30 text-forest text-[10px] font-mono">yellow_last_access</span>
                  </div>
                </div>
                <div className="bg-snow border border-mist rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-monday-violet" />
                    <h3 className="text-sm font-semibold text-ink">Cookies de Preferencias</h3>
                  </div>
                  <p className="text-xs text-slate-text">
                    Permiten recordar sus preferencias como idioma, tema y configuración
                    regional para proporcionar una experiencia más personalizada.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-periwinkle/30 text-monday-violet text-[10px] font-mono">locale</span>
                    <span className="px-2 py-0.5 rounded-md bg-periwinkle/30 text-monday-violet text-[10px] font-mono">theme</span>
                  </div>
                </div>
                <div className="bg-snow border border-mist rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-sky-accent" />
                    <h3 className="text-sm font-semibold text-ink">Cookies Analíticas</h3>
                  </div>
                  <p className="text-xs text-slate-text">
                    Nos ayudan a entender cómo los usuarios interactúan con el servicio
                    para mejorar la experiencia. Solo se usan con su consentimiento.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-sky-accent/30 text-[#006680] text-[10px] font-mono">_ga</span>
                    <span className="px-2 py-0.5 rounded-md bg-sky-accent/30 text-[#006680] text-[10px] font-mono">_gid</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">3. Cookies de Terceros</h2>
              <p>
                Algunas cookies son colocadas por servicios de terceros que aparecen en
                nuestras páginas. No controlamos estas cookies. Los principales terceros
                que utilizamos son:
              </p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li><strong>Stripe:</strong> Procesamiento de pagos seguro.</li>
                <li><strong>Google Analytics:</strong> Análisis de uso del sitio (con consentimiento).</li>
                <li><strong>Supabase:</strong> Autenticación y almacenamiento en la nube.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">4. Gestión de Cookies</h2>
              <p>
                Puede controlar y eliminar las cookies a través de la configuración de su
                navegador. Tenga en cuenta que desactivar ciertas cookies puede afectar
                el funcionamiento del servicio:
              </p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                <li><strong>Firefox:</strong> Preferencias → Privacidad y seguridad → Cookies</li>
                <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
                <li><strong>Edge:</strong> Configuración → Cookies y permisos del sitio</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">5. Consentimiento</h2>
              <p>
                Al utilizar nuestro servicio, usted acepta el uso de cookies conforme a
                esta política. Si no está de acuerdo, por favor desactive las cookies en
                su navegador o absténgase de utilizar el servicio.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">6. Cambios en esta Política</h2>
              <p>
                Nos reservamos el derecho de modificar esta Política de Cookies en cualquier
                momento. Los cambios serán efectivos desde su publicación en esta página.
                Le notificaremos sobre cambios significativos por correo electrónico.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">7. Contacto</h2>
              <p>
                Para consultas sobre esta Política de Cookies:
              </p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li>Correo: <a href="mailto:privacidad@yellow-erp.cl" className="text-monday-violet hover:text-monday-violet-hover">privacidad@yellow-erp.cl</a></li>
                <li>Dirección: Santiago, Chile</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
