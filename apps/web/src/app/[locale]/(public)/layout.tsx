import type { Metadata } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yellow-erp.cl';

const title = 'Yellow ERP — El ERP chileno que emite facturas al SII mientras vendes';
const description =
 'Inventario, ventas, compras, contabilidad y nómina chilena en un solo SaaS. Emite DTEs al SII en segundos, con AFP/ISAPRE, UF y cumplimiento SII nativo. Contáctanos para más información.';
const ogImage = '/screenshots/dashboard-wide.png';

const jsonLd = {
 '@context': 'https://schema.org',
 '@graph': [
  {
   '@type': 'Organization',
   name: 'Yellow ERP',
   url: appUrl,
   email: 'hola@yellow-erp.cl',
   areaServed: 'CL',
   address: {
    '@type': 'PostalAddress',
    addressLocality: 'Santiago',
    addressCountry: 'CL',
   },
  },
  {
   '@type': 'SoftwareApplication',
   name: 'Yellow ERP',
   applicationCategory: 'BusinessApplication',
   operatingSystem: 'Web',
   description,
   url: appUrl,
   inLanguage: 'es-CL',
   offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'CLP',
    lowPrice: '23920',
    highPrice: '99900',
    offerCount: 3,
   },
  },
 ],
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
 // localePrefix 'as-needed': el español (idioma por defecto) vive en '/', el resto en '/{locale}'
 const path = params.locale === 'es' ? '/' : `/${params.locale}`;
 const url = `${appUrl}${path}`;
 return {
  title,
  description,
  keywords: [
   'ERP Chile',
   'facturación electrónica SII',
   'DTE',
   'software para PyMEs',
   'nómina chilena',
   'AFP',
   'ISAPRE',
   'contabilidad Chile',
  ],
  alternates: {
   canonical: url,
   languages: {
    es: `${appUrl}/`,
    en: `${appUrl}/en`,
   },
  },
  openGraph: {
   type: 'website',
   locale: 'es_CL',
   url,
   siteName: 'Yellow ERP',
   title,
   description,
   images: [
    {
     url: ogImage,
     width: 1280,
     height: 720,
     alt: 'Yellow ERP — módulo de ventas y facturación electrónica',
    },
   ],
  },
  twitter: {
   card: 'summary_large_image',
   title,
   description,
   images: [ogImage],
  },
  robots: {
   index: true,
   follow: true,
  },
 };
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
 return (
  <>
   {children}
   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  </>
 );
}
