import { ArrowUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AutoTalleresBreadcrumbs() {
  const pathname = usePathname();
  
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length <= 1) return null;
  
  return (
    <nav className="flex items-center text-sm text-slate-500 mb-4">
      <a href="/auto-talleres" className="hover:text-orange-600 transition-colors">
        Talleres
      </a>
      {parts.slice(1).map((part, index) => {
        const isLast = index === parts.length - 2;
        const href = `/auto-talleres/${parts.slice(1, index + 2).join('/')}`;
        const label = part.charAt(0).toUpperCase() + part.slice(1);
        return (
          <span key={part} className="flex items-center gap-2">
            <ArrowUpRight className="w-3 h-3 rotate-45" />
            {isLast ? (
              <span className="text-slate-900 font-semibold">{label}</span>
            ) : (
              <a href={href} className="hover:text-orange-600 transition-colors">
                {label}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}
