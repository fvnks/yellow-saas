'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { FolderKanban } from "lucide-react";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import CompanySwitcher from '@/components/ui/company-switcher';
import { getApiClient } from '@/lib/api-client';

export default function ProjectSidebarBrandHeader() {
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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <Link href="/select" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FACC15] p-1.5 shadow-md shadow-amber-500/10 shrink-0 hover:scale-105 transition-transform">
            <Image src="/logo/yellow-cube.svg" alt="Yellow Proyectos" width={28} height={28} className="drop-shadow-sm" />
          </Link>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-[10px] font-black tracking-widest text-[#FACC15] uppercase">Yellow ERP</span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-full border border-amber-500/20">
                <FolderKanban className="w-2.5 h-2.5" /> Proyectos
              </span>
            </div>
            <CompanySwitcher
              companies={companies}
              currentCompanyId={currentCompanyId}
              onSwitch={handleSwitch}
              loading={loading}
            />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}