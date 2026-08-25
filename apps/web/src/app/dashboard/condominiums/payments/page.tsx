"use client";
import { useEffect, useState } from "react";
import { DollarSign, Search, ChevronDown, Plus, CreditCard } from "lucide-react";
import { getApiClient } from "@/lib/api-client";
import { toast } from "sonner";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [statements, setStatements] = useState<any[]>([]);
  const [form, setForm] = useState({ statement_id: "", amount: "", payment_date: "", payment_method: "transfer", reference: "", notes: "" });

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
    api.request(`/condos/${selectedProperty}/payments?limit=100`)
      .then((res) => setPayments(res.data || []))
      .catch(() => {});
  }, [selectedProperty]);

  const openModal = async () => {
    if (!selectedProperty) return;
    const api = getApiClient();
    try {
      const res = await api.request(`/condos/${selectedProperty}/statements?limit=100`);
      setStatements((res.data || []).filter((s: any) => s.status !== "paid"));
    } catch {}
    setForm({ statement_id: "", amount: "", payment_date: new Date().toISOString().split("T")[0], payment_method: "transfer", reference: "", notes: "" });
    setShowModal(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.statement_id || !form.amount) { toast.error("Selecciona colilla y monto"); return; }
    const api = getApiClient();
    try {
      await api.request(`/condos/${selectedProperty}/payments`, {
        method: "POST",
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      toast.success("Pago registrado");
      setShowModal(false);
      const res = await api.request(`/condos/${selectedProperty}/payments?limit=100`);
      setPayments(res.data || []);
    } catch {
      toast.error("Error al registrar pago");
    }
  };

  const filtered = payments.filter((p) =>
    (p.unit_number || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#232323]">Pagos</h1>
          <p className="text-sm text-[#718EBF] mt-1">Registrar y consultar pagos de expensas</p>
        </div>
        <button onClick={openModal} className="bg-[#16DBCC] hover:bg-[#14C4B6] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-[background-color,transform] duration-150 active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Registrar Pago
        </button>
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

      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6EFF5]">
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Unidad</th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Monto</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Método</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Referencia</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#718EBF]">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#718EBF]">No hay pagos registrados</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors duration-100">
                    <td className="px-4 py-3 text-xs text-[#718EBF]">
                      {new Date(p.payment_date).toLocaleDateString("es-CL", { timeZone: "UTC" })}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#232323] font-medium">{p.unit_number}</td>
                    <td className="px-4 py-3 text-xs text-emerald-600 text-right font-medium">${parseFloat(p.amount || "0").toLocaleString("es-CL")}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF] capitalize">{p.payment_method}</td>
                    <td className="px-4 py-3 text-xs text-[#718EBF]">{p.reference || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-[#E6EFF5] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#232323]">Registrar Pago</h2>
              <button onClick={() => setShowModal(false)} className="text-[#718EBF] hover:text-[#232323] transition-colors">
                <span className="text-xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handlePayment}>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#232323]">Colilla *</label>
                  <select value={form.statement_id} onChange={(e) => setForm({ ...form, statement_id: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150">
                    <option value="">Seleccionar colilla...</option>
                    {statements.map((s) => (
                      <option key={s.id} value={s.id}>Unidad {s.unit_number} - ${parseFloat(s.total_amount || "0").toLocaleString("es-CL")}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#232323]">Monto *</label>
                    <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="0" placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#232323]">Fecha *</label>
                    <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#232323]">Método</label>
                    <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150">
                      <option value="transfer">Transferencia</option>
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#232323]">Referencia</label>
                    <input type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" aria-label="N° comprobante" placeholder="N° comprobante" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#232323]">Notas</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150" rows={2} aria-label="Observaciones..." placeholder="Observaciones..." />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#E6EFF5] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="bg-white border border-[#E6EFF5] hover:bg-[#F5F7FA] text-[#232323] px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150">
                  Cancelar
                </button>
                <button type="submit" className="bg-[#16DBCC] hover:bg-[#14C4B6] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-[background-color,transform] duration-150 active:scale-[0.98]">
                  <CreditCard className="w-4 h-4" />
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
