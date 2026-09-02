import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from '@/i18n';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Yellow ERP',
  description: 'Multi-tenant SaaS ERP para PYMEs chilenas',
};

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        {children}
      </Providers>
    </NextIntlClientProvider>
  );
}
