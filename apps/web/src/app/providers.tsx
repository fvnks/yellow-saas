'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/ui/theme-toggle';
import { PermissionsProvider } from '@/lib/permissions';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <PermissionsProvider>
        {children}
      </PermissionsProvider>
    </ThemeProvider>
  );
}
