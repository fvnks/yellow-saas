import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';

async function verifySession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('portal_profesor_token')?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.tipo !== 'profesor') return null;
    if (typeof payload.id !== 'string') return null;
    return payload;
  } catch {
    return null;
  }
}

export default async function PortalProfesorProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await verifySession();

  if (!session) {
    redirect('/portal-profesor');
  }

  return <>{children}</>;
}
