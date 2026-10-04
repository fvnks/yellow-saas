'use client';

import { ReactNode, useEffect } from 'react';
import { ThemeProvider } from '@/components/ui/theme-toggle';
import { PermissionsProvider } from '@/lib/permissions';
import { syncAuthCookie } from '@/lib/auth-token';

export default function Providers({ children }: { children: ReactNode }) {
  // Mantiene la cookie `auth-token` sincronizada con localStorage:
  // el middleware lee la cookie en el servidor y el cliente lee
  // localStorage. Si la cookie se pierde (se borraron cookies,
  // expiró una cookie de otro flujo), la reescribimos en cuanto
  // el app monta, antes de cualquier navegación protegida.
  useEffect(() => {
    syncAuthCookie();
  }, []);

  return (
    <ThemeProvider>
      <PermissionsProvider>
        {children}
      </PermissionsProvider>
    </ThemeProvider>
  );
}
