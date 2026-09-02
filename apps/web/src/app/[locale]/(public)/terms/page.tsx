'use client';

import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground">Terminos y Condiciones</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ultima actualizacion: Enero 2025</p>

          <div className="mt-10 space-y-8 text-sm text-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">1. Aceptacion de los Terminos</h2>
              <p>
                Al acceder y utilizar Yellow ERP (&quot;el Servicio&quot;), usted acepta estos Terminos y Condiciones.
                Si no esta de acuerdo con alguno de estos terminos, no debe utilizar el Servicio.
                Nos reservamos el derecho de modificar estos terminos en cualquier momento,
                siendo efectivos desde su publicacion en esta pagina.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">2. Descripcion del Servicio</h2>
              <p>
                Yellow ERP es un software de gestion empresarial (ERP) proporcionado como servicio
                en la nube (SaaS) disenado para pequenas y medianas empresas chilenas.
                El Servicio incluye modulos de ventas, inventario, compras, contabilidad,
                remuneraciones, CRM, reportes y punto de venta, entre otros.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">3. Cuentas de Usuario</h2>
              <p>
                Para utilizar el Servicio, usted debe crear una cuenta proporcionando informacion
                verdadera y completa. Usted es responsable de mantener la confidencialidad de sus
                credenciales de acceso y de todas las actividades que ocurran bajo su cuenta.
                Debe notificarnos inmediatamente ante cualquier uso no autorizado de su cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">4. Suscripcion y Pagos</h2>
              <p>
                El Servicio se ofrece mediante suscripciones de pago con diferentes planes.
                Los precios estan disponibles en nuestra pagina de precios y pueden ser modificados
                con aviso previo de 30 dias. Los pagos se realizan por adelantado y no son
                reembolsables salvo disposicion legal aplicable. El periodo de prueba gratuito
                de 14 dias no requiere tarjeta de credito y se convierte automaticamente en
                una suscripcion de pago al finalizar, salvo que el usuario cancele antes.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">5. Propiedad Intelectual</h2>
              <p>
                Todo el contenido, codigo fuente, disenos, marcas registradas y demas materiales
                propios del Servicio son propiedad exclusiva de Yellow ERP o sus licenciantes.
                Usted recibe una licencia limitada, no exclusiva e intransferible para utilizar
                el Servicio conforme a estos terminos y su plan de suscripcion.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">6. Datos del Usuario</h2>
              <p>
                Usted es el propietario de los datos que ingresa al Servicio. Yellow ERP no
                accedera, utilizara ni compartira los datos del usuario para fines distintos
                al funcionamiento del Servicio, salvo autorizacion expresa del usuario o
                requerimiento legal. Los datos se almacenan en servidores seguros con encriptacion
                en transito y en reposo.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">7. Disponibilidad del Servicio</h2>
              <p>
                Nos esforzamos por mantener el Servicio disponible 24/7, pero no garantizamos
                disponibilidad ininterrumpida. Podemos realizar mantenimientos programados con
                aviso previo de 48 horas. No seremos responsables por perdidas o danos
                resultantes de interrupciones del Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">8. Limitacion de Responsabilidad</h2>
              <p>
                Yellow ERP no sera responsable por danos indirectos, incidentales, especiales
                o consecuentes que resulten del uso o imposibilidad de uso del Servicio.
                Nuestra responsabilidad total no excedera el monto pagado por el usuario
                en los ultimos 12 meses del Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">9. Terminacion</h2>
              <p>
                El usuario puede cancelar su suscripcion en cualquier momento desde su panel
                de configuracion. Yellow ERP podra suspender o cancelar cuentas que violen
                estos terminos. Tras la terminacion, los datos del usuario seran retenidos
                por 30 dias y luego eliminados de forma permanente.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">10. Ley Aplicable</h2>
              <p>
                Estos terminos se rigen por las leyes de la Republica de Chile. Cualquier
                controversia sera sometida a los tribunales competentes de Santiago de Chile.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
