'use client';

import Link from 'next/link';
import { Building2, ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
            <div className="w-10 h-10 bg-periwinkle/30 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-monday-violet" />
            </div>
            <h1 className="text-3xl font-bold text-ink">Términos y Condiciones</h1>
          </div>
          <p className="mt-2 text-sm text-slate-text">Última actualización: Enero 2025</p>

          <div className="mt-10 space-y-8 text-sm text-ink leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-ink mb-2">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar Yellow ERP ("el Servicio"), usted acepta estos Términos y Condiciones.
                Si no está de acuerdo con alguno de estos términos, no debe utilizar el Servicio.
                Nos reservamos el derecho de modificar estos términos en cualquier momento,
                siendo efectivos desde su publicación en esta página.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">2. Descripción del Servicio</h2>
              <p>
                Yellow ERP es un software de gestión empresarial (ERP) proporcionado como servicio
                en la nube (SaaS) diseñado para pequeñas y medianas empresas chilenas.
                El Servicio incluye módulos de ventas, inventario, compras, contabilidad,
                remuneraciones, CRM, reportes y punto de venta, entre otros.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">3. Cuentas de Usuario</h2>
              <p>
                Para utilizar el Servicio, usted debe crear una cuenta proporcionando información
                verdadera y completa. Usted es responsable de mantener la confidencialidad de sus
                credenciales de acceso y de todas las actividades que ocurran bajo su cuenta.
                Debe notificarnos inmediatamente ante cualquier uso no autorizado de su cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">4. Suscripción y Pagos</h2>
              <p>
                El Servicio se ofrece mediante suscripciones de pago con diferentes planes.
                Los precios están disponibles en nuestra página de precios y pueden ser modificados
                con aviso previo de 30 días. Los pagos se realizan por adelantado y no son
                reembolsables salvo disposición legal aplicable. El periodo de prueba gratuito
                de 14 días no requiere tarjeta de crédito y se convierte automáticamente en
                una suscripción de pago al finalizar, salvo que el usuario cancele antes.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">5. Propiedad Intelectual</h2>
              <p>
                Todo el contenido, código fuente, diseños, marcas registradas y demás materiales
                propios del Servicio son propiedad exclusiva de Yellow ERP o sus licenciantes.
                Usted recibe una licencia limitada, no exclusiva e intransferible para utilizar
                el Servicio conforme a estos términos y su plan de suscripción.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">6. Datos del Usuario</h2>
              <p>
                Usted es el propietario de los datos que ingresa al Servicio. Yellow ERP no
                accederá, utilizará ni compartirá los datos del usuario para fines distintos
                al funcionamiento del Servicio, salvo autorización expresa del usuario o
                requerimiento legal. Los datos se almacenan en servidores seguros con encriptación
                en tránsito y en reposo.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">7. Disponibilidad del Servicio</h2>
              <p>
                Nos esforzamos por mantener el Servicio disponible 24/7, pero no garantizamos
                disponibilidad ininterrumpida. Podemos realizar mantenimientos programados con
                aviso previo de 48 horas. No seremos responsables por pérdidas o daños
                resultantes de interrupciones del Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">8. Limitación de Responsabilidad</h2>
              <p>
                Yellow ERP no será responsable por daños indirectos, incidentales, especiales
                o consecuentes que resulten del uso o imposibilidad de uso del Servicio.
                Nuestra responsabilidad total no excederá el monto pagado por el usuario
                en los últimos 12 meses del Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">9. Terminación</h2>
              <p>
                El usuario puede cancelar su suscripción en cualquier momento desde su panel
                de configuración. Yellow ERP podrá suspender o cancelar cuentas que violen
                estos términos. Tras la terminación, los datos del usuario serán retenidos
                por 30 días y luego eliminados de forma permanente.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-ink mb-2">10. Ley Aplicable</h2>
              <p>
                Estos términos se rigen por las leyes de la República de Chile. Cualquier
                controversia será sometida a los tribunales competentes de Santiago de Chile.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
