"use client";
import { useEffect, useState } from "react";
import { Calendar, Plus, Calculator, Eye, ChevronDown } from "lucide-react";
import Link from "next/link";
import { getApiClient } from "@/lib/api-client";
import { toast } from "sonner";

export default function PeriodsPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState<string | null>(null);

  useEffect(() => {
    const api = getApiClient();
    api
      .request("/condos?limit=100")
      .then((res) => {
        const props = res.data || [];
        setProperties(props);
        if (props.length > 0) setSelectedProperty(props[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProperty) return;
    const api = getApiClient();
    api
      .request(`/condos/${selectedProperty}/periods?limit=50`)
      .then((res) => setPeriods(res.data || []))
      .catch(() => {});
  }, [selectedProperty]);

  const handleCreatePeriod = async () => {
    if (!selectedProperty) {
      toast.error("Selecciona una propiedad");
      return;
    }
    const now = new Date();
    const periodDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const dueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-10`;
    const api = getApiClient();
    try {
      await api.request(`/condos/${selectedProperty}/periods`, {
        method: "POST",
        body: JSON.stringify({ period_date: periodDate, due_date: dueDate }),
      });
      toast.success("Período creado");
      const res = await api.request(
        `/condos/${selectedProperty}/periods?limit=50`,
      );
      setPeriods(res.data || []);
    } catch {
      toast.error("Error al crear período");
    }
  };

  const handleCalculate = async (periodId: string) => {
    setCalculating(periodId);
    const api = getApiClient();
    try {
      const result = await api.request(
        `/condos/${selectedProperty}/periods/${periodId}/calculate`,
        { method: "POST" },
      );
      toast.success(
        `Calculado: ${result.data?.statements_count || 0} colillas generadas`,
      );
      const res = await api.request(
        `/condos/${selectedProperty}/periods?limit=50`,
      );
      setPeriods(res.data || []);
    } catch {
      toast.error("Error al calcular");
    } finally {
      setCalculating(null);
    }
  };

  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#232323]">Períodos</h1>
          <p className="text-sm text-[#718EBF] mt-1">
            Crear períodos y calcular expensas comunes
          </p>
        </div>
        <button
          onClick={handleCreatePeriod}
          className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-[background-color,transform] duration-150 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Nuevo Período
        </button>
      </div>

      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <label className="text-xs font-medium text-[#232323]">
            Propiedad:
          </label>
          <div className="relative">
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 pr-8 text-sm text-[#232323] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150 appearance-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718EBF] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6EFF5]">
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">
                  Período
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">
                  Monto Total
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-[#718EBF]"
                  >
                    Cargando...
                  </td>
                </tr>
              ) : periods.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-[#718EBF]"
                  >
                    No hay períodos creados
                  </td>
                </tr>
              ) : (
                periods.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors duration-100"
                  >
                    <td className="px-4 py-3 text-xs text-[#232323] font-medium">
                      {new Date(p.period_date).toLocaleDateString("es-CL", {
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#718EBF]">
                      {new Date(p.due_date).toLocaleDateString("es-CL", {
                        timeZone: "UTC",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${statusColors[p.status] || statusColors.draft}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#232323]">
                      {p.total_amount
                        ? `$${parseFloat(p.total_amount).toLocaleString("es-CL")}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/condominiums/properties/${selectedProperty}/periods/${p.id}`}
                          className="p-1.5 hover:bg-[#F5F7FA] rounded-lg transition-colors"
                          title="Ver gastos"
                        >
                          <Eye className="w-4 h-4 text-[#718EBF]" />
                        </Link>
                        <button
                          onClick={() => handleCalculate(p.id)}
                          disabled={calculating === p.id}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Calcular expensas"
                        >
                          <Calculator
                            className={`w-4 h-4 ${calculating === p.id ? "text-[#718EBF] animate-spin" : "text-[#2D60FF]"}`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
 const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    calculated: "bg-blue-50 text-blue-700 border-blue-200",
    open: "bg-amber-50 text-amber-700 border-amber-200",
    closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

       </div>
      </div>
    </div>
  );
}
