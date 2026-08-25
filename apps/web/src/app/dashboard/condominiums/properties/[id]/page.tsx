"use client";
import { use, useEffect, useState, useRef } from "react";
import { Building, Plus, Search, Edit, Trash2, Eye, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getApiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [property, setProperty] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const coefficientsRef = useRef<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.request(`/condos/${id}`),
      api.request(`/condos/${id}/units?limit=100`),
      api.request(`/condos/${id}/coefficients`),
    ])
      .then(([propRes, unitsRes, coeffRes]) => {
        setProperty(propRes.data);
        setUnits(unitsRes.data || []);
        coefficientsRef.current = coeffRes.data || [];
      })
      .catch(() => toast.error("Error al cargar propiedad"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm("¿Eliminar esta unidad?")) return;
    const api = getApiClient();
    try {
      await api.request(`/condos/${id}/units/${unitId}`, { method: "DELETE" });
      setUnits((prev) => prev.filter((u) => u.id !== unitId));
      toast.success("Unidad eliminada");
    } catch {
      toast.error("Error al eliminar unidad");
    }
  };

  if (loading) return <div className="p-6 text-sm text-[#718EBF]">Cargando...</div>;
  if (!property) return <div className="p-6 text-sm text-[#FE5C73]">Propiedad no encontrada</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-[#F5F7FA] rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#718EBF]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#232323]">{property.name}</h1>
            <p className="text-sm text-[#718EBF] mt-1">{property.address || "Sin dirección"}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/condominiums/properties/${id}/edit`} className="bg-white border border-[#E6EFF5] hover:bg-[#F5F7FA] text-[#232323] px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors duration-150">
            <Edit className="w-4 h-4" />
            Editar
          </Link>
          <Link href={`/dashboard/condominiums/properties/${id}/units/new`} className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-[background-color,transform] duration-150 active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            Nueva Unidad
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5">
          <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider mb-1">Ciudad</p>
          <p className="text-sm font-medium text-[#232323]">{property.city || "-"} {property.commune ? `(${property.commune})` : ""}</p>
        </div>
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5">
          <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider mb-1">Total Unidades</p>
          <p className="text-sm font-medium text-[#232323]">{property.total_units || units.length}</p>
        </div>
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5">
          <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider mb-1">Día Vencimiento</p>
          <p className="text-sm font-medium text-[#232323]">Día {property.due_day || 10}</p>
        </div>
      </div>

      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-[#E6EFF5]">
          <h3 className="text-sm font-semibold text-[#232323]">Unidades ({units.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6EFF5]">
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Unidad</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Residente</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Email</th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {units.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#718EBF]">No hay unidades registradas</td></tr>
              ) : (
                units.map((u) => (
                  <tr key={u.id} className="border-b border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors duration-100">
                    <td className="px-4 py-3 text-xs text-[#232323] font-medium">{u.unit_number}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF] capitalize">{u.type}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF]">{u.resident_name || "-"}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF]">{u.resident_email || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/condominiums/properties/${id}/units/${u.id}/edit`} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <Edit className="w-4 h-4 text-[#2D60FF]" />
                        </Link>
                        <button onClick={() => handleDeleteUnit(u.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
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
