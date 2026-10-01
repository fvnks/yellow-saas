import Link from 'next/link';

const footerLinks = {
  Producto: [
    { label: 'Módulos', href: '#modules' },
    { label: 'Precios', href: '#pricing' },
    { label: 'API', href: '/es/api/docs' },
    { label: 'Changelog', href: '/es/changelog' },
  ],
  Empresa: [
    { label: 'Sobre Nosotros', href: '/es/about' },
    { label: 'Blog', href: '/es/blog' },
    { label: 'Contacto', href: 'mailto:hola@yellow-erp.cl' },
    { label: 'Empleos', href: '/es/careers' },
  ],
  Legal: [
    { label: 'Privacidad', href: '/es/privacy' },
    { label: 'Términos', href: '/es/terms' },
    { label: 'Cookies', href: '/es/cookies' },
  ],
  Soporte: [
    { label: 'Documentación', href: '/es/docs' },
    { label: 'Centro de Ayuda', href: '/es/ayuda' },
    { label: 'Estado del Sistema', href: 'https://status.yellow-erp.cl' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-mist bg-snow text-ink ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-full bg-sunshine flex items-center justify-center shadow-md shadow-ink/20 ring-2 ring-sunshine-dark/30">
                <span className="text-ink font-bold text-base">Y</span>
              </div>
              <span className="text-lg font-bold text-ink">
                Yellow <span className="text-sunshine">ERP</span>
              </span>
            </Link>
            <p className="text-xs text-slate-text leading-relaxed">
              ERP multi-tenant para PyMEs chilenas. Facturación electrónica SII, nómina y gestión integral.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-[10px] font-semibold text-slate-text uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-text hover:text-ink transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Cookie Banner */}
        <div className="mt-8 pt-6 border-t border-mist">
          <div className="bg-cloud border border-mist rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-sunshine/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sunshine-dark text-sm">🍪</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-ink mb-1">Uso de Cookies</h3>
                <p className="text-[11px] text-slate-text leading-relaxed">
                  Utilizamos cookies esenciales para el funcionamiento del servicio (autenticación, seguridad y preferencias de sesión).
                  No utilizamos cookies de rastreo publicitario. Puede gestionar sus preferencias en la configuración de su navegador.
                </p>
                <Link
                  href="/es/cookies"
                  className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-sunshine hover:text-sunshine-dark transition-colors"
                >
                  Más información sobre cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-mist flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-text">
            &copy; {new Date().getFullYear()} Yellow ERP Chile. Todos los derechos reservados.
          </p>
          <p className="text-xs text-slate-text font-medium">
            Diseñado para la realidad empresarial chilena 🇨🇱
          </p>
        </div>
      </div>
    </footer>
  );
}