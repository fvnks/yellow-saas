import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verificarTokenPortal } from '@/api/portal-apoderado/lib/auth';
import ShellApoderado from '../components/shell-apoderado';

/**
 * Guard server-side de las páginas con sesión del portal de apoderados.
 *
 * Sin cookie o con token vencido / de otro tipo → vuelve al login con el aviso
 * de expiración. La portada y el login viven fuera de este grupo de rutas,
 * así que nunca pasan por aquí. (`cookies()` es síncrono en Next 14.)
 */
export default async function PortalApoderadoProtegidoLayout({
  children,
}: {
  children: ReactNode;
}) {
  const token = cookies().get('portal_token')?.value ?? null;
  const sesion = await verificarTokenPortal(token);

  if (!sesion) {
    redirect('/portal-apoderado/login?expired=1');
  }

  return <ShellApoderado>{children}</ShellApoderado>;
}
