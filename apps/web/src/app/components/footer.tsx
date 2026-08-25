import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';

const footerLinks = {
  Producto: [
    { label: 'ERP & Finanzas', href: '/dashboard' },
    { label: 'Recursos Humanos', href: '/hr' },
    { label: 'Proyectos & Kanban', href: '/projects' },
    { label: 'Gestión de Recetas', href: '/recetas' },
    { label: 'Precios', href: '#pricing' },
  ],
  Empresa: [
    { label: 'Sobre Nosotros', href: '/about' },
    { label: 'Términos y Condiciones', href: '/terms' },
    { label: 'Política de Privacidad', href: '/privacy' },
    { label: 'Contacto', href: '/contact' },
  ],
  Soporte: [
    { label: 'Centro de Ayuda', href: '/ayuda' },
    { label: 'Tickets de Soporte', href: '/ayuda/tickets' },
    { label: 'Integración SII Chile', href: '/ayuda' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[#E6EFF5] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#1814F3] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                Y
              </div>
              <span className="text-lg font-bold text-[#232323] tracking-tight">
                Yellow ERP
              </span>
            </Link>
            <p className="text-sm text-[#718EBF] max-w-sm leading-relaxed">
              El ERP empresarial multi-tenant diseñado para PyMEs e industrias chilenas. Automatiza inventario, ventas, compras, contabilidad y facturación electrónica SII.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conexión Directa SII Chile & Cumplimiento Normativo</span>
            </div>
          </div>

          {/* Nav Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#232323] hover:text-[#1814F3] transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[#E6EFF5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#718EBF]">
          <p>© {new Date().getFullYear()} Yellow ERP Chile. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1">
            Diseñado para potenciar PyMEs chilenas
          </div>
        </div>
      </div>
    </footer>
  );
}
