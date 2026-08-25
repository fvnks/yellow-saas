"use client";
import { useEffect, useState } from "react";
import { Building, Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { getApiClient } from "@/lib/api-client";
import { toast } from "sonner";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const api = getApiClient();
    api.request("/condos?limit=100")
      .then((res) => setProperties(res.data || []))
      .catch(() => toast.error("Error al cargar propiedades"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = properties.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta propiedad?")) return;
    const api = getApiClient();
    try {
      await api.request(`/condos/${id}`, { method: "DELETE" });
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast.success("Propiedad eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#232323]">Propiedades</h1>
          <p className="text-sm text-[#718EBF] mt-1">Administrar edificios y condominios</p>
        </div>
        <Link
          href="/dashboard/condominiums/properties/new"
          className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-[background-color,transform] duration-150 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Nueva Propiedad
        </Link>
      </div>

      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718EBF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar por nombre o ciudad..." placeholder="Buscar por nombre o ciudad..."
              className="w-full bg-white border border-[#E6EFF5] rounded-xl pl-10 pr-4 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6EFF5]">
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">RUT</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Ciudad</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Unidades</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Vto Día</th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#718EBF]">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#718EBF]">No se encontraron propiedades</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors duration-100">
                    <td className="px-4 py-3 text-xs text-[#232323] font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF]">{p.rut || "-"}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF]">{p.city || "-"}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF]">{p.total_units || 0}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF]">{p.due_day || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/condominiums/properties/${p.id}`} className="p-1.5 hover:bg-[#F5F7FA] rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-[#718EBF]" />
                        </Link>
                        <Link href={`/dashboard/condominiums/properties/${p.id}/edit`} className="p-1.5 hover:bg-[#F5F7FA] rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-[#718EBF]" />
                        </Link>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-[#FE5C73]" />
                        </button>
                      </div>
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
