import Link from 'next/link';
import { BookOpen, CalendarCheck, CreditCard, Info, LogIn, Megaphone } from 'lucide-react';
import { PRIMARY_ACTION } from '@/components/educacion/button-classes';

/**
 * Portada pública del portal de apoderados: la puerta de entrada del módulo.
 * Antes redirigía a `/login?redirect=/educacion` (login de personal, con copy
 * que no le correspondía); ahora es la vitrina del portal con su propio CTA.
 */

const TARJETAS = [
  {
    icono: BookOpen,
    titulo: 'Notas',
    texto: 'Revisa las calificaciones de tus hijos por asignatura y período.',
  },
  {
    icono: CalendarCheck,
    titulo: 'Asistencia',
    texto: 'Consulta inasistencias, atrasos y justificaciones del año escolar.',
  },
  {
    icono: CreditCard,
    titulo: 'Pagos',
    texto: 'Revisa movimientos, vencimientos y boletas de apoderado.',
  },
  {
    icono: Megaphone,
    titulo: 'Comunicados',
    texto: 'Recibe anuncios, circulares y mensajes del establecimiento.',
  },
];

export default function PortadaApoderadoPage({
  searchParams,
}: {
  searchParams?: { aviso?: string };
}) {
  const avisoRegistro = searchParams?.aviso === 'registro';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <span className="text-xl font-black text-ink">Portal de Apoderados</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {avisoRegistro && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>
              El registro en línea está deshabilitado. El colegio crea tu cuenta y te
              entrega tus credenciales de acceso.
            </p>
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-ink">Portal del Apoderado</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Un solo lugar para acompañar la escolaridad de tus hijos: notas, asistencia,
            pagos y comunicados del colegio, disponibles cuando los necesites.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/portal-apoderado/login"
              className={`${PRIMARY_ACTION} inline-flex items-center gap-2 px-5 py-2.5`}
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Entrar al portal
            </Link>
            <p className="text-sm text-slate-500">
              ¿No tienes cuenta? El colegio te entrega tu correo y clave de acceso.
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TARJETAS.map(({ icono: Icono, titulo, texto }) => (
            <div
              key={titulo}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="inline-flex rounded-xl bg-electric-cyan/15 p-2 text-[#006680]">
                <Icono className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-3 font-black text-ink">{titulo}</h2>
              <p className="mt-1 text-sm text-slate-600">{texto}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          ¿Problemas para entrar? Contacta a la administración del colegio.
        </p>
      </main>
    </div>
  );
}
