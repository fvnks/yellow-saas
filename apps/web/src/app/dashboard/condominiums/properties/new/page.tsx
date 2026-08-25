"use client";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { getApiClient } from "@/lib/api-client";
import { toast } from "sonner";

export default function NewPropertyPage() {
  const router = useRouter();
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("El nombre es requerido"); return; }
    setSaving(true);
    const api = getApiClient();
    try {
      await api.request("/condos", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          total_units: form.total_units ? parseInt(form.total_units) : 0,
          reserve_fund_pct: parseFloat(form.reserve_fund_pct),
          late_interest_pct: parseFloat(form.late_interest_pct),
          due_day: parseInt(form.due_day),
        }),
      });
      toast.success("Propiedad creada");
      router.push("/dashboard/condominiums/properties");
    } catch {
      toast.error("Error al crear propiedad");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-[#F5F7FA] rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#718EBF]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#232323]">Nueva Propiedad</h1>
          <p className="text-sm text-[#718EBF] mt-1">Registrar un nuevo edificio o condominio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-[#E6EFF5]">
          <h3 className="text-sm font-semibold text-[#232323]">Datos de la Propiedad</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Nombre *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="Ej: Edificio Los Aromos" placeholder="Ej: Edificio Los Aromos" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">RUT</label>
            <input type="text" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="12.345.678-9" placeholder="12.345.678-9" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Dirección</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="Av. Principal 1234" placeholder="Av. Principal 1234" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Comuna</label>
            <input type="text" value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="Providencia" placeholder="Providencia" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Ciudad</label>
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="Santiago" placeholder="Santiago" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Total Unidades</label>
            <input type="number" value={form.total_units} onChange={(e) => setForm({ ...form, total_units: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="0" placeholder="0" />
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
