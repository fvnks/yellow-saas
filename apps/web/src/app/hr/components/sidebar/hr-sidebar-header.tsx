'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import CompanySwitcher from '@/components/ui/company-switcher';
import { getApiClient } from '@/lib/api-client';
import { Building2, Users } from 'lucide-react';

export default function HRSidebarBrandHeader() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    if (companyId) setCurrentCompanyId(companyId);

    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const api = getApiClient();
      const res = await api.getAuthCompanies();
      setCompanies(res.companies || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
    setLoading(false);
  };

  const handleSwitch = async (companyId: string) => {
    try {
      const api = getApiClient();
      const res = await api.switchCompany(companyId);
      document.cookie = `auth-token=${res.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      localStorage.setItem('company_id', companyId);
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch company:', err);
    }
  };

  const currentCompany = companies.find(c => c.id === currentCompanyId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <Link href="/hr" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FACC15] p-1.5 shadow-md shadow-amber-500/10 shrink-0 hover:scale-105 transition-transform">
            <Image src="/logo/yellow-cube.svg" alt="Yellow RRHH" width={28} height={28} className="drop-shadow-sm" />
          </Link>

          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-black tracking-widest text-[#FACC15] uppercase">Yellow ERP</span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded-full border border-rose-500/20">
                <Users className="w-2.5 h-2.5" /> RRHH
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-100 truncate">
                {currentCompany ? currentCompany.name : 'Mi Empresa'}
              </span>

              {companies.length > 1 && (
                <div className="ml-auto shrink-0">
                  <CompanySwitcher
                    companies={companies}
                    currentCompanyId={currentCompanyId}
                    onSwitch={handleSwitch}
                    loading={loading}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}