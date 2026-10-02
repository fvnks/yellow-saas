'use client';

import Link from 'next/link';
import { Building2, ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cloud">
      <nav className="fixed top-0 inset-x-0 bg-snow/80 backdrop-blur-xl border-b border-mist z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-sunshine rounded-xl flex items-center justify-center">
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
            <div className="w-10 h-10 bg-mint/30 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-forest" />
            </div>
            <h1 className="text-3xl font-bold text-ink">Política de Privacidad</h1>
          </div>
          <p className="mt-2 text-sm text-slate-text">Última actualización: Enero 2025</p>

          <div className="mt-10 space-y-8 text-sm text-ink leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-ink mb-2">1. Información que Recopilamos</h2>
              <p>Recopilamos los siguientes tipos de información:</p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li><strong>Datos de cuenta:</strong> nombre, correo electrónico, contraseña encriptada, rol y empresa.</li>
                <li><strong>Datos de empresa:</strong> razón social, RUT, giro, dirección, teléfono.</li>
                <li><strong>Datos de uso:</strong> interacciones con el Servicio, registros de actividad, métricas de rendimiento.</li>
                <li><strong>Datos de pago:</strong> información de facturación procesada por nuestra pasarela de pago segura (no almacenamos datos de tarjeta de crédito).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">2. Uso de la Información</h2>
              <p>Utilizamos su información para:</p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li>Proveer, mantener y mejorar el Servicio.</li>
                <li>Procesar transacciones y enviar notificaciones relacionadas.</li>
                <li>Enviar comunicaciones de servicio, actualizaciones y alertas de seguridad.</li>
                <li>Prevenir fraudes, abusos y problemas técnicos.</li>
                <li>Cumplir obligaciones legales y regulatorias.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">3. Protección de Datos</h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizacionales para proteger
                su información contra acceso no autorizado, alteración, divulgación o destrucción.
                Estas medidas incluyen encriptación TLS/SSL en tránsito, encriptación AES-256
                en reposo, controles de acceso basados en roles y auditorías periódicas de seguridad.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">4. Compartición de Datos</h2>
              <p>No vendemos ni compartimos su información personal con terceros, excepto:</p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li>Con proveedores de servicios que nos ayudan a operar el Servicio (hosting, pasarelas de pago), sujetos a acuerdos de confidencialidad.</li>
                <li>Cuando sea requerido por ley, orden judicial o autoridad competente.</li>
                <li>En caso de fusión, adquisición o venta de activos, con aviso previo a los usuarios.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">5. Retención de Datos</h2>
              <p>
                Conservamos su información mientras su cuenta esté activa o sea necesaria para
                proveer el Servicio. Tras la cancelación, retenemos los datos por 30 días para
                permitir la recuperación, y luego los eliminamos de forma permanente e irrecuperable.
                Datos anonimizados pueden conservarse indefinidamente para fines estadísticos.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">6. Sus Derechos (Ley 19.628)</h2>
              <p>
                Conforme a la Ley 19.628 sobre Protección de Datos Personales en Chile, usted tiene
                derecho a:
              </p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li><strong>Acceso:</strong> solicitar información sobre los datos personales que mantenemos.</li>
                <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos.</li>
                <li><strong>Eliminación:</strong> solicitar la eliminación de sus datos personales.</li>
                <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos para fines específicos.</li>
              </ul>
              <p className="mt-2">
                Para ejercer estos derechos, contáctenos a{' '}
                <a href="mailto:privacidad@yellow-erp.cl" className="text-sunshine-ink hover:text-sunshine-ink-hover">privacidad@yellow-erp.cl</a>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">7. Cookies</h2>
              <p>
                Utilizamos cookies esenciales para el funcionamiento del Servicio (autenticación,
                preferencias de sesión). No utilizamos cookies de rastreo publicitario.
                Puede configurar su navegador para rechazar cookies, aunque esto podría
                afectar el funcionamiento del Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">8. Servicios de Terceros</h2>
              <p>
                El Servicio puede contener enlaces a sitios de terceros. No somos responsables
                de las prácticas de privacidad de dichos sitios. Le recomendamos revisar las
                políticas de privacidad de cualquier sitio de terceros.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">9. Cambios en esta Política</h2>
              <p>
                Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier
                momento. Los cambios serán efectivos desde su publicación en esta página.
                Le notificaremos sobre cambios significativos por correo electrónico.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">10. Contacto</h2>
              <p>Para consultas sobre esta Política de Privacidad o sobre el tratamiento de sus datos personales:</p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li>Correo: <a href="mailto:privacidad@yellow-erp.cl" className="text-sunshine-ink hover:text-sunshine-ink-hover">privacidad@yellow-erp.cl</a></li>
                <li>Dirección: Santiago, Chile</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
