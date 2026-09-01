import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from '@/i18n';
import './globals.css';
import Providers from './providers';
import { SupportWidget } from '@/components/support/support-widget';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Yellow ERP',
  description: 'Multi-tenant SaaS ERP para PYMEs chilenas',
  manifest: '/manifest.json',
  themeColor: '#0f172a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Yellow ERP',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

function PwaScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => console.log('[PWA] SW registered', reg.scope))
      .catch(err => console.error('[PWA] SW registration failed', err));
  });
}
        `,
      }}
    />
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  return (
    <html lang="es" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Yellow ERP" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="icon" href="/favicon.ico" />
        <PwaScript />
      </head>
      <body className="bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <SupportWidget />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}