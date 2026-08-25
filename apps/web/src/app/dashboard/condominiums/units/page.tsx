"use client";
import { useEffect, useState } from "react";
import { Building2, ChevronDown, Save, Trash2 } from "lucide-react";
import { getApiClient } from "@/lib/api-client";
import { toast } from "sonner";

export default function UnitsIndexPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    api.request(`/condos/${selectedProperty}/units?limit=200`)
      .then((res) => setUnits(res.data || []))
      .catch(() => {});
  }, [selectedProperty]);

  const handleDelete = async (unitId: string) => {
    if (!confirm("¿Eliminar esta unidad?")) return;
    const api = getApiClient();
    try {
      await api.request(`/condos/units/${unitId}`, { method: "DELETE" });
      setUnits((prev) => prev.filter((u) => u.id !== unitId));
      toast.success("Unidad eliminada");
    } catch {
      toast.error("Error al eliminar unidad");
    }
  };

  if (loading) return <div className="p-6 text-sm text-[#718EBF]">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#232323]">Unidades</h1>
        <p className="text-sm text-[#718EBF] mt-1">Gestión de unidades por propiedad</p>
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
        </div>
      </div>

      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6EFF5]">
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Unidad</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Propiedad</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Residente</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Email</th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#718EBF]">Cargando...</td></tr>
              ) : units.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#718EBF]">No hay unidades</td></tr>
              ) : (
                units.map((u) => (
                  <tr key={u.id} className="border-b border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors duration-100">
                    <td className="px-4 py-3 text-xs text-[#232323] font-medium">{u.unit_number}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF]">{properties.find((p) => p.id === selectedProperty)?.name || "-"}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF]">{u.resident_name || "-"}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF]">{u.resident_email || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-[#FE5C73]" />
                      </button>
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
