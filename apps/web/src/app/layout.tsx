import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { SupportWidget } from '@/components/support/support-widget'; const inter = Inter({ subsets: ['latin'], variable: '--font-sans',
}); export const metadata: Metadata = { title: 'Yellow ERP', description: 'Multi-tenant SaaS ERP para PYMEs chilenas',
}; export default function RootLayout({ children,
}: { children: React.ReactNode;
}) { return ( <html lang="es" className={`${inter.variable} antialiased`} suppressHydrationWarning> <body className="bg-background text-foreground"> <Providers> {children} <SupportWidget /> </Providers> </body> </html> );
}