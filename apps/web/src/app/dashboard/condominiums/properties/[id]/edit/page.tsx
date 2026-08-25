"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getApiClient } from "@/lib/api-client";
import { toast } from "sonner";

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    rut: "",
    address: "",
    commune: "",
    city: "",
    total_units: "",
    reserve_fund_pct: "5",
    late_interest_pct: "1.5",
    due_day: "10",
    is_active: true,
  });

  useEffect(() => {
    const api = getApiClient();
    api.request(`/condos/${propertyId}`)
      .then((res) => {
        const p = res.data;
        setForm({
          name: p.name || "",
          rut: p.rut || "",
          address: p.address || "",
          commune: p.commune || "",
          city: p.city || "",
          total_units: String(p.total_units || 0),
          reserve_fund_pct: String(p.reserve_fund_pct || 5),
          late_interest_pct: String(p.late_interest_pct || 1.5),
          due_day: String(p.due_day || 10),
          is_active: p.is_active ?? true,
        });
      })
      .catch(() => toast.error("Error al cargar propiedad"))
      .finally(() => setLoading(false));
  }, [propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const api = getApiClient();
    try {
      await api.request(`/condos/${propertyId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          total_units: form.total_units ? parseInt(form.total_units) : 0,
          reserve_fund_pct: parseFloat(form.reserve_fund_pct),
          late_interest_pct: parseFloat(form.late_interest_pct),
          due_day: parseInt(form.due_day),
        }),
      });
      toast.success("Propiedad actualizada");
      router.push(`/dashboard/condominiums/properties/${propertyId}`);
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-[#718EBF]">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-[#F5F7FA] rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#718EBF]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#232323]">Editar Propiedad</h1>
          <p className="text-sm text-[#718EBF] mt-1">Modificar datos del condominio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-[#E6EFF5]">
          <h3 className="text-sm font-semibold text-[#232323]">Datos de la Propiedad</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Nombre *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">RUT</label>
            <input type="text" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-xs font-medium text-[#232323]">Dirección</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Comuna</label>
            <input type="text" value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Ciudad</label>
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Total Unidades</label>
            <input type="number" value={form.total_units} onChange={(e) => setForm({ ...form, total_units: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Fondo Reserva (%)</label>
            <input type="number" step="0.01" value={form.reserve_fund_pct} onChange={(e) => setForm({ ...form, reserve_fund_pct: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Interés Mora (%)</label>
            <input type="number" step="0.01" value={form.late_interest_pct} onChange={(e) => setForm({ ...form, late_interest_pct: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Día Vencimiento</label>
            <input type="number" min="1" max="31" value={form.due_day} onChange={(e) => setForm({ ...form, due_day: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E6EFF5] flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="bg-white border border-[#E6EFF5] hover:bg-[#F5F7FA] text-[#232323] px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-[background-color,transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
