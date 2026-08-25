"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { getApiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

const UNIT_TYPES = [
  { value: "apartment", label: "Departamento" },
  { value: "house", label: "Casa" },
  { value: "office", label: "Oficina" },
  { value: "commercial", label: "Local Comercial" },
  { value: "parking", label: "Estacionamiento" },
  { value: "storage", label: "Bodega" },
];

export default function UnitEditPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const unitId = params.unitId as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    unit_number: "",
    type: "apartment",
    resident_name: "",
    resident_email: "",
    resident_phone: "",
    notes: "",
  });

  useEffect(() => {
    const api = getApiClient();
    api.request(`/condos/${propertyId}/units/${unitId}`)
      .then((res) => {
        const u = res.data;
        setForm({
          unit_number: u.unit_number || "",
          type: u.type || "apartment",
          resident_name: u.resident_name || "",
          resident_email: u.resident_email || "",
          resident_phone: u.resident_phone || "",
          notes: u.notes || "",
        });
      })
      .catch(() => toast.error("Error al cargar unidad"))
      .finally(() => setLoading(false));
  }, [propertyId, unitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.unit_number) return toast.error("El número de unidad es obligatorio");
    setSaving(true);
    try {
      const api = getApiClient();
      await api.request(`/condos/${propertyId}/units/${unitId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      toast.success("Unidad actualizada");
      router.push(`/dashboard/condominiums/properties/${propertyId}`);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-[#718EBF]">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/condominiums/properties/${propertyId}`} className="p-2 hover:bg-[#F5F7FA] rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#718EBF]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#232323]">Editar Unidad</h1>
          <p className="text-sm text-[#718EBF] mt-1">Actualizar datos de la unidad</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-6 space-y-5">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#232323]">Número de Unidad *</label>
          <input
            type="text"
            value={form.unit_number}
            onChange={(e) => setForm({ ...form, unit_number: e.target.value })}
            className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#232323]">Tipo</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150"
          >
            {UNIT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#232323]">Nombre del Residente</label>
          <input
            type="text"
            value={form.resident_name}
            onChange={(e) => setForm({ ...form, resident_name: e.target.value })}
            className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150"
            aria-label="Nombre completo" placeholder="Nombre completo"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Email</label>
            <input
              type="email"
              value={form.resident_email}
              onChange={(e) => setForm({ ...form, resident_email: e.target.value })}
              className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150"
              aria-label="correo@ejemplo.com" placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Teléfono</label>
            <input
              type="text"
              value={form.resident_phone}
              onChange={(e) => setForm({ ...form, resident_phone: e.target.value })}
              className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150"
              aria-label="+56 9 1234 5678" placeholder="+56 9 1234 5678"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#232323]">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150 resize-none"
            aria-label="Notas adicionales..." placeholder="Notas adicionales..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href={`/dashboard/condominiums/properties/${propertyId}`}
            className="bg-white border border-[#E6EFF5] hover:bg-[#F5F7FA] text-[#232323] px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-[background-color,transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
