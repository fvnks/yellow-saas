import Link from 'next/link';

const footerLinks = {
  Producto: [
    { label: 'Módulos', href: '#modules' },
    { label: 'Precios', href: '#pricing' },
    { label: 'API', href: '/api/docs' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Empresa: [
    { label: 'Sobre Nosotros', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contacto', href: 'mailto:hola@yellow-erp.cl' },
    { label: 'Empleos', href: '/careers' },
  ],
  Legal: [
    { label: 'Privacidad', href: '/privacy' },
    { label: 'Términos', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
  ],
  Soporte: [
    { label: 'Documentación', href: '/docs' },
    { label: 'Centro de Ayuda', href: '/help' },
    { label: 'Estado del Sistema', href: 'https://status.yellow-erp.cl' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Yellow <span className="text-slate-400 font-normal dark:text-slate-500">ERP</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              ERP multi-tenant para PyMEs chilenas. Facturación electrónica SII, nómina y más.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} Yellow ERP. Todos los derechos reservados.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Hecho con dedicación en Chile
          </p>
        </div>
      </div>
    </footer>
  );
}
