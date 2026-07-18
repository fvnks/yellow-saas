'use client';

import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Yellow ERP</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900">Politica de Privacidad</h1>
          <p className="mt-2 text-sm text-slate-400">Ultima actualizacion: Enero 2025</p>

          <div className="mt-10 space-y-8 text-sm text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-2">1. Informacion que Recopilamos</h2>
              <p>
                Recopilamos los siguientes tipos de informacion:
              </p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li><strong>Datos de cuenta:</strong> nombre, correo electronico, contrasena encriptada, rol y empresa.</li>
                <li><strong>Datos de empresa:</strong> razon social, RUT, giro, direccion, telefono.</li>
                <li><strong>Datos de uso:</strong> interacciones con el Servicio, registros de actividad, metricas de rendimiento.</li>
                <li><strong>Datos de pago:</strong> informacion de facturacion procesada por nuestra pasarela de pago segura (no almacenamos datos de tarjeta de credito).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-2">2. Uso de la Informacion</h2>
              <p>Utilizamos su informacion para:</p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li>Proveer, mantener y mejorar el Servicio.</li>
                <li>Procesar transacciones y enviar notificaciones relacionadas.</li>
                <li>Enviar comunicaciones de servicio, actualizaciones y alertas de seguridad.</li>
                <li>Prevenir fraude, abusos y problemas tecnicos.</li>
                <li>Cumplir obligaciones legales y regulatorias.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-2">3. Proteccion de Datos</h2>
              <p>
                Implementamos medidas de seguridad tecnicas y organizacionales para proteger
                su informacion contra acceso no autorizado, alteracion, divulgacion o destruccion.
                Estas medidas incluyen encriptacion TLS/SSL en transito, encriptacion AES-256
                en reposo, controles de acceso basados en roles y auditorias periódicas de seguridad.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-2">4. Comparticion de Datos</h2>
              <p>
                No vendemos ni compartimos su informacion personal con terceros, excepto:
              </p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li>Con proveedores de servicios que nos ayudan a operar el Servicio (hosting, pasarelas de pago), sujetos a acuerdos de confidencialidad.</li>
                <li>Cuando sea requerido por ley, orden judicial o autoridad competente.</li>
                <li>En caso de fusion, adquisicion o venta de activos, con aviso previo a los usuarios.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-2">5. Retencion de Datos</h2>
              <p>
                Conservamos su informacion mientras su cuenta este activa o sea necesaria para
                proveer el Servicio. Tras la cancelacion, retenemos los datos por 30 dias para
                permitir la recuperacion, y luego los eliminamos de forma permanente e irrecuperable.
                Datos anonymizados pueden conservarse indefinidamente para fines estadisticos.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-2">6. Sus Derechos (Ley 19.628)</h2>
              <p>
                Conforme a la Ley 19.628 sobre Proteccion de Datos Personales en Chile, usted tiene
                derecho a:
              </p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li><strong>Acceso:</strong> solicitar informacion sobre los datos personales que maintenemos.</li>
                <li><strong>Rectificacion:</strong> solicitar la correccion de datos inexactos.</li>
                <li><strong>Eliminacion:</strong> solicitar la eliminacion de sus datos personales.</li>
                <li><strong>Oposicion:</strong> oponerse al tratamiento de sus datos para fines especificos.</li>
              </ul>
              <p className="mt-2">
                Para ejercer estos derechos, contactenos a{' '}
                <a href="mailto:privacidad@yellow-erp.cl" className="text-indigo-600 hover:text-indigo-500">privacidad@yellow-erp.cl</a>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-2">7. Cookies</h2>
              <p>
                Utilizamos cookies esenciales para el funcionamiento del Servicio (autenticacion,
                preferencias de sesion). No utilizamos cookies de rastreo publicitario.
                Puede configurar su navegador para rechazar cookies, aunque esto podria
                afectar el funcionamiento del Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-2">8. Servicios de Terceros</h2>
              <p>
                El Servicio puede contener enlaces a sitios de terceros. No somos responsables
                de las praticas de privacidad de dichos sitios. Le recomendamos revisar las
                politicas de privacidad de cualquier sitio de terceros.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-2">9. Cambios en esta Politica</h2>
              <p>
                Nos reservamos el derecho de modificar esta Politica de Privacidad en cualquier
                momento. Los cambios seran efectivos desde su publicacion en esta pagina.
                Le notificaremos sobre cambios significativos por correo electronico.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-2">10. Contacto</h2>
              <p>
                Para consultas sobre esta Politica de Privacidad o sobre el tratamiento de
                sus datos personales:
              </p>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li>Correo: <a href="mailto:privacidad@yellow-erp.cl" className="text-indigo-600 hover:text-indigo-500">privacidad@yellow-erp.cl</a></li>
                <li>Direccion: Santiago, Chile</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
