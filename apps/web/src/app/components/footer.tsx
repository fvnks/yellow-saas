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
    { label: 'Centro de Ayuda', href: '/ayuda' },
    { label: 'Estado del Sistema', href: 'https://status.yellow-erp.cl' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[#E6EFF5] bg-white text-[#232323]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-[#1814F3] flex items-center justify-center shadow-md shadow-[#1814F3]/20">
                <span className="text-white font-bold text-base">Y</span>
              </div>
              <span className="text-lg font-bold text-[#232323]">
                Yellow <span className="text-[#1814F3]">ERP</span>
              </span>
            </Link>
            <p className="text-xs text-[#718EBF] leading-relaxed">
              ERP multi-tenant para PyMEs chilenas. Facturación electrónica SII, nómina y gestión integral.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#718EBF] hover:text-[#1814F3] transition-colors duration-150"
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
        <div className="mt-12 pt-8 border-t border-[#E6EFF5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#718EBF]">
            &copy; {new Date().getFullYear()} Yellow ERP Chile. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#718EBF] font-medium">
            Diseñado para la realidad empresarial chilena 🇨🇱
          </p>
        </div>
      </div>
    </footer>
  );
}
