"use client";
import { useEffect, useState } from "react";
import { Receipt, Search, ChevronDown, DollarSign, CheckCircle, Clock } from "lucide-react";
import { getApiClient } from "@/lib/api-client";
import { toast } from "sonner";

export default function StatementsPage() {
  const [statements, setStatements] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const api = getApiClient();
    api.request("/condos?limit=100")
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
    api.request(`/condos/${selectedProperty}/statements?limit=100`)
      .then((res) => setStatements(res.data || []))
      .catch(() => {});
  }, [selectedProperty]);

  const filtered = statements.filter((s) =>
    (s.unit_number || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.status || "").toLowerCase().includes(search.toLowerCase())
  );

  
  const totals = filtered.reduce((acc, s) => ({
    total: acc.total + parseFloat(s.total_amount || "0"),
    paid: acc.paid + parseFloat(s.amount_paid || "0"),
  }), { total: 0, paid: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#232323]">Colillas</h1>
          <p className="text-sm text-[#718EBF] mt-1">Estado de cuentas por unidad y período</p>
        </div>
      </div>

      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <label className="text-xs font-medium text-[#232323]">Propiedad:</label>
          <div className="relative">
            <select value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)} className="bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 pr-8 text-sm text-[#232323] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150 appearance-none">
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718EBF] pointer-events-none" />
          </div>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718EBF]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar unidad..." placeholder="Buscar unidad..." className="w-full bg-white border border-[#E6EFF5] rounded-xl pl-10 pr-4 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5">
          <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider mb-1">Total a Cobrar</p>
          <p className="text-2xl font-bold text-[#232323]">${totals.total.toLocaleString("es-CL")}</p>
        </div>
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5">
          <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider mb-1">Total Recaudado</p>
          <p className="text-2xl font-bold text-emerald-600">${totals.paid.toLocaleString("es-CL")}</p>
        </div>
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5">
          <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider mb-1">Por Cobrar</p>
          <p className="text-2xl font-bold text-amber-600">${(totals.total - totals.paid).toLocaleString("es-CL")}</p>
        </div>
      </div>

      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6EFF5]">
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Unidad</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Período</th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Expensa</th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Fondo Reserva</th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Total</th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Pagado</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#718EBF]">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#718EBF]">No hay colillas generadas</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors duration-100">
                    <td className="px-4 py-3 text-xs text-[#232323] font-medium">{s.unit_number}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF]">
                      {s.period_date ? new Date(s.period_date).toLocaleDateString("es-CL", { month: "short", year: "numeric", timeZone: "UTC" }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#232323] text-right">${parseFloat(s.common_expense || "0").toLocaleString("es-CL")}</td>
                    <td className="px-4 py-3 text-xs text-[#232323] text-right">${parseFloat(s.reserve_fund || "0").toLocaleString("es-CL")}</td>
                    <td className="px-4 py-3 text-xs text-[#232323] text-right font-medium">${parseFloat(s.total_amount || "0").toLocaleString("es-CL")}</td>
                    <td className="px-4 py-3 text-xs text-emerald-600 text-right">${parseFloat(s.amount_paid || "0").toLocaleString("es-CL")}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${statusConfig[s.status]?.class || statusConfig.pending.class}`}>
                        {statusConfig[s.status]?.label || s.status}
    const statusConfig: Record<string, { label: string; class: string }> = {
    pending: { label: "Pendiente", class: "bg-amber-50 text-amber-700 border-amber-200" },
    partial: { label: "Parcial", class: "bg-blue-50 text-blue-700 border-blue-200" },
    paid: { label: "Pagado", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    overdue: { label: "Vencido", class: "bg-rose-50 text-rose-700 border-rose-200" },
  };

                  </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
