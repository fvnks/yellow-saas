"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export default function SidebarBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const formatSegment = (segment: string) => {
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <nav className="flex items-center gap-1 text-sm">
      <a href="/dashboard" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
        <Home className="h-4 w-4" />
      </a>
      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-slate-400" />
            {isLast ? (
              <span className="font-medium text-slate-900">{formatSegment(segment)}</span>
            ) : (
              <a href={path} className="text-slate-500 hover:text-slate-700 transition-colors">
                {formatSegment(segment)}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}
