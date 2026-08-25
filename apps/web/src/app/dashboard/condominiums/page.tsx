"use client";
import { useEffect, useState } from "react";
import {
  Building,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { getApiClient } from "@/lib/api-client";

export default function CondominiumsDashboard() {
  const [stats, setStats] = useState({
    properties: 0,
    units: 0,
    pendingStatements: 0,
    totalCollected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = getApiClient();
    api.request("/condos?limit=100")
      .then(async (propsRes) => {
        const props = propsRes.data || [];
        let totalUnits = 0;
        let totalPending = 0;
        let totalPaid = 0;

        for (const p of props) {
          try {
            const [uRes, sRes, payRes] = await Promise.all([
              api.request(`/condos/${p.id}/units?limit=1`),
              api.request(`/condos/${p.id}/statements?status=pending&limit=1`),
              api.request(`/condos/${p.id}/payments?limit=100`),
            ]);
            totalUnits += uRes.pagination?.total || 0;
            totalPending += sRes.pagination?.total || 0;
            totalPaid += (payRes.data || []).reduce((s: number, pay: any) => s + parseFloat(pay.amount || "0"), 0);
          } catch {}
        }

        setStats({
          properties: props.length,
          units: totalUnits,
          pendingStatements: totalPending,
          totalCollected: totalPaid,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#232323]">Condominios</h1>
          <p className="text-sm text-[#718EBF] mt-1">Gestión de propiedades y expensas comunes</p>
        </div>
        <Link
          href="/dashboard/condominiums/properties/new"
          className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-[background-color,transform] duration-150 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Nueva Propiedad
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5 hover:border-[#E6EFF5]/80 transition-colors duration-150">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Propiedades</p>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">{loading ? "..." : stats.properties}</p>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5 hover:border-[#E6EFF5]/80 transition-colors duration-150">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Unidades</p>
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">{loading ? "..." : stats.units}</p>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5 hover:border-[#E6EFF5]/80 transition-colors duration-150">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Colillas Pendientes</p>
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">{loading ? "..." : stats.pendingStatements}</p>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5 hover:border-[#E6EFF5]/80 transition-colors duration-150">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Total Recaudado</p>
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">{loading ? "..." : `$${stats.totalCollected.toLocaleString("es-CL")}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/condominiums/properties" className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-6 hover:border-[#1814F3]/30 transition-colors duration-150 group">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-[#232323]">Propiedades</h3>
          <p className="text-xs text-[#718EBF] mt-1">Administrar edificios y condominios</p>
        </Link>
        <Link href="/dashboard/condominiums/periods" className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-6 hover:border-[#1814F3]/30 transition-colors duration-150 group">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-sm font-semibold text-[#232323]">Períodos</h3>
          <p className="text-xs text-[#718EBF] mt-1">Crear períodos y calcular expensas</p>
        </Link>
        <Link href="/dashboard/condominiums/statements" className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-6 hover:border-[#1814F3]/30 transition-colors duration-150 group">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Receipt className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-sm font-semibold text-[#232323]">Colillas</h3>
          <p className="text-xs text-[#718EBF] mt-1">Estado de cuentas por unidad</p>
        </Link>
      </div>
    </div>
  );
}
