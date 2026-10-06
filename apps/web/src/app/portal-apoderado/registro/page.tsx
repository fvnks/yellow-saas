import Link from 'next/link';
import { UserX } from 'lucide-react';
import { PRIMARY_ACTION } from '@/components/educacion/button-classes';

/**
 * El auto-registro de apoderados quedó apagado en la Fase 1a: las credenciales
 * las genera el colegio desde Educación → Apoderados (con CSV de claves). La
 * página se queda como aviso para no dejar enlaces muertos, y la API
 * correspondiente responde 410 (el código de registro sigue listo por si se
 * reactiva con código de activación).
 */
export default function RegistroApoderadoDesactivadoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="inline-flex rounded-xl bg-slate-100 p-3 text-slate-500">
          <UserX className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="mt-4 text-2xl font-black text-ink">Registro deshabilitado</h1>
        <p className="mt-3 text-sm text-slate-600">
          El registro en línea de apoderados está deshabilitado. El colegio crea tu
          cuenta y te entrega tu correo y clave de acceso.
        </p>
        <Link
          href="/portal-apoderado"
          className={`${PRIMARY_ACTION} mt-6 inline-block px-5 py-2.5`}
        >
          Volver a la portada
        </Link>
      </div>
    </div>
  );
}
