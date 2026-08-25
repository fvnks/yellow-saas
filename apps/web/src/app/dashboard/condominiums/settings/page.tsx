"use client";
import { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import { getApiClient } from "@/lib/api-client";
import { toast } from "sonner";

export default function CondosSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [form, setForm] = useState({ name: "", reserve_fund_pct: "5", late_interest_pct: "1.5", due_day: "10" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const api = getApiClient();
    api.request("/condos?limit=100")
      .then((res) => {
        const props = res.data || [];
        setProperties(props);
        if (props.length > 0) {
          const first = props[0];
          setSelectedProperty(first.id);
          setForm({
            name: first.name || "",
            reserve_fund_pct: String(first.reserve_fund_pct || 5),
            late_interest_pct: String(first.late_interest_pct || 1.5),
            due_day: String(first.due_day || 10),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePropertyChange = (id: string) => {
    setSelectedProperty(id);
    const prop = properties.find((p) => p.id === id);
    if (prop) {
      setForm({
        name: prop.name || "",
        reserve_fund_pct: String(prop.reserve_fund_pct || 5),
        late_interest_pct: String(prop.late_interest_pct || 1.5),
        due_day: String(prop.due_day || 10),
      });
    }
  };

  const handleSave = async () => {
    if (!selectedProperty) return;
    setSaving(true);
    const api = getApiClient();
    try {
      await api.request(`/condos/${selectedProperty}`, {
        method: "PUT",
        body: JSON.stringify({
          reserve_fund_pct: parseFloat(form.reserve_fund_pct),
          late_interest_pct: parseFloat(form.late_interest_pct),
          due_day: parseInt(form.due_day),
        }),
      });
      toast.success("Configuración guardada");
    } catch {
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-[#718EBF]">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#232323]">Configuración de Condominios</h1>
        <p className="text-sm text-[#718EBF] mt-1">Ajustes generales del módulo de condominios</p>
      </div>

      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-6 space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#232323]">Propiedad</label>
          <select value={selectedProperty} onChange={(e) => handlePropertyChange(e.target.value)} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150">
            {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Fondo de Reserva (%)</label>
            <input type="number" step="0.01" value={form.reserve_fund_pct} onChange={(e) => setForm({ ...form, reserve_fund_pct: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Interés Mora (%)</label>
            <input type="number" step="0.01" value={form.late_interest_pct} onChange={(e) => setForm({ ...form, late_interest_pct: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#232323]">Día de Vencimiento</label>
            <input type="number" min="1" max="31" value={form.due_day} onChange={(e) => setForm({ ...form, due_day: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={handleSave} disabled={saving} className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-[background-color,transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
