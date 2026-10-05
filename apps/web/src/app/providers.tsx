'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/ui/theme-toggle';
import { PermissionsProvider } from '@/lib/permissions';
import { CookieConsent } from '@/components/cookie-consent/CookieConsent';
import { AuthWatcher } from '@/components/auth-watcher';

export default function Providers({ children }: { children: ReactNode }) {
 return (
 <ThemeProvider>
 <PermissionsProvider>
 <AuthWatcher />
 {children}
 </PermissionsProvider>
 </ThemeProvider>
 );
}
