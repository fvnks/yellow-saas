'use client';
import { ReactNode } from 'react';
import { PermissionsProvider } from '@/lib/permissions';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PermissionsProvider>
      {children}
    </PermissionsProvider>
  );
}
