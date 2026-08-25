"use client";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getApiClient } from "@/lib/api-client";
import { toast } from "sonner";

export default function NewUnitPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    unit_number: "",
    type: "apartment",
    owner_id: "",
    resident_name: "",
    resident_email: "",
    resident_phone: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.unit_number) { toast.error("El número de unidad es requerido"); return; }
    setSaving(true);
    const api = getApiClient();
    try {
      await api.request(`/condos/${propertyId}/units`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Unidad creada");
      router.push(`/dashboard/condominiums/properties/${propertyId}`);
    } catch {
      toast.error("Error al crear unidad");
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
          <h1 className="text-xl font-bold text-[#232323]">Nueva Unidad</h1>
          <p className="text-sm text-[#718EBF] mt-1">Registrar una nueva unidad en la propiedad</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-[#E6EFF5]">
          <h3 className="text-sm font-semibold text-[#232323]">Datos de la Unidad</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Número de Unidad *</label>
            <input type="text" value={form.unit_number} onChange={(e) => setForm({ ...form, unit_number: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="12A" placeholder="12A" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Tipo</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150">
              <option value="apartment">Departamento</option>
              <option value="store">Local</option>
              <option value="office">Oficina</option>
              <option value="parking">Estacionamiento</option>
              <option value="storage">Depósito</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Dueño (ID)</label>
            <input type="text" value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="UUID del cliente" placeholder="UUID del cliente" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Nombre Residente</label>
            <input type="text" value={form.resident_name} onChange={(e) => setForm({ ...form, resident_name: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="Propietario / Inquilino" placeholder="Propietario / Inquilino" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Email</label>
            <input type="email" value={form.resident_email} onChange={(e) => setForm({ ...form, resident_email: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="email@ejemplo.com" placeholder="email@ejemplo.com" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Teléfono</label>
            <input type="tel" value={form.resident_phone} onChange={(e) => setForm({ ...form, resident_phone: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="+56 9 1234 5678" placeholder="+56 9 1234 5678" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-xs font-medium text-[#232323]">Notas</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" rows={2} aria-label="Observaciones sobre la unidad..." placeholder="Observaciones sobre la unidad..." />
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
