import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { SupportWidget } from '@/components/support/support-widget';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Yellow ERP',
  description: 'Multi-tenant SaaS ERP para PYMEs chilenas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} antialiased`} suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900">
        <Providers>
          {children}
          <SupportWidget />
        </Providers>
      </body>
    </html>
  );
}