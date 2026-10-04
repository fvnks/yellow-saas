'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/ui/theme-toggle';
import { PermissionsProvider } from '@/lib/permissions';
import { CookieConsent } from '@/components/cookie-consent/CookieConsent';

export default function Providers({ children }: { children: ReactNode }) {
 return (
 <ThemeProvider>
 <PermissionsProvider>
 {children}
 </PermissionsProvider>
 </ThemeProvider>
 );
}
