'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Check, Building2, LogOut, Settings, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Company {
  id: string;
  name: string;
  slug?: string;
  logo_url?: string;
  plan?: string;
  status?: string;
  role: string;
  is_default?: boolean;
  is_active?: boolean;
}

interface CompanySwitcherProps {
  companies: Company[];
  currentCompanyId: string;
  onSwitch: (companyId: string) => void;
  loading?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  manager: 'Gerente',
  member: 'Miembro',
  viewer: 'Observador',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-amber-50 text-amber-700 border border-amber-200',
  admin: 'bg-blue-50 text-primary border border-primary/20',
  manager: 'bg-blue-50 text-blue-700 border border-blue-200',
  member: 'bg-muted text-foreground border border-border',
  viewer: 'bg-muted text-muted-foreground border border-border',
};

export default function CompanySwitcher({ companies, currentCompanyId, onSwitch, loading }: CompanySwitcherProps) {
  const currentCompany = companies.find(c => c.id === currentCompanyId) || companies[0];

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl animate-pulse">
        <div className="w-6 h-6 bg-muted rounded-lg" />
        <div className="h-3 bg-muted rounded w-20" />
      </div>
    );
  }

  if (!currentCompany) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-sidebar-accent/50 transition-all duration-200 group cursor-pointer w-full">
          <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-semibold text-foreground truncate flex-1 text-left group-data-[collapsible=icon]:hidden">
            {currentCompany.name}
          </span>
          {companies.length > 1 && (
            <ChevronDown className="w-3 h-3 text-muted-foreground group-data-[collapsible=icon]:hidden flex-shrink-0 group-hover:text-foreground transition-colors" />
          )}
        </button>
      </DropdownMenuTrigger>
      {companies.length > 1 && (
        <DropdownMenuContent side="bottom" align="start" className="w-64">
          <div className="px-2 py-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
              Cambiar Empresa
            </p>
          </div>
          <DropdownMenuSeparator />
          {companies.map(company => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => {
                if (company.id !== currentCompanyId) {
                  onSwitch(company.id);
                }
              }}
              className="cursor-pointer flex items-center gap-3 px-2 py-2"
            >
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{company.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-flex items-center px-1.5 py-0 rounded-full text-[8px] font-semibold ${ROLE_COLORS[company.role] || ROLE_COLORS.member}`}>
                    {ROLE_LABELS[company.role] || company.role}
                  </span>
                </div>
              </div>
              {company.id === currentCompanyId && (
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
