'use client';

import { useState, useEffect } from 'react';
import { FileSignature, Plus, X, Save, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const statusCfg: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  draft: { label: 'Borrador', color: 'text-slate-600', bg: 'bg-slate-100', icon: Clock },
  active: { label: 'Activo', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle },
  completed: { label: 'Completado', color: 'text-blue-700', bg: 'bg-blue-50', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50', icon: AlertTriangle },
};

export default function SupplierContracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    supplier_id: '', title: '', description: '', start_date: new Date().toISOString().split('T')[0], end_date: '', total_amount: '', payment_terms: '',
    items: [{ description: '', quantity: '1', unit_price: '' }] as any[],
  });

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    Promise.all([
      fetch(`/api/companies/${companyId}/supplier-contracts`).then(r => r.json()),
      fetch(`/api/companies/${companyId}/suppliers`).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([cRes, sRes]) => {
      setContracts((cRes.data || []).map((c: any) => ({ ...c, items: typeof c.items === 'string' ? JSON.parse(c.items) : c.items || [] })));
      setSuppliers(sRes.data || []);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    const companyId = localStorage.getItem('company_id');
    const res = await fetch(`/api/companies/${companyId}/supplier-contracts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, total_amount: parseFloat(form.total_amount) || 0, items: form.items.map(i => ({ ...i, quantity: parseInt(i.quantity) || 1, unit_price: parseFloat(i.unit_price) || 0 })) }),
    });
    if (res.ok) { setShowForm(false); loadData(); }
  };

  const loadData = async () => {
    const companyId = localStorage.getItem('company_id');
    const res = await fetch(`/api/companies/${companyId}/supplier-contracts`);
    if (res.ok) { const j = await res.json(); setContracts((j.data || []).map((c: any) => ({ ...c, items: typeof c.items === 'string' ? JSON.parse(c.items) : c.items || [] }))); }
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: '1', unit_price: '' }] });
  const removeItem = (i: number) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i: number, k: string, v: string) => { const n = [...form.items]; (n[i] as any)[k] = v; setForm({ ...form, items: n }); };
  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><FileSignature className="w-4 h-4 text-slate-500" /><span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Contratos de Proveedor</span></div>
        <button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"><Plus className="w-3.5 h-3.5" /> Nuevo</button>
      </div>
      {contracts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl"><FileSignature className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-xs text-slate-400">Sin contratos</p></div>
      ) : (
        <div className="space-y-2">
          {contracts.map(c => {
            const cfg = statusCfg[c.status] || statusCfg.draft;
            const Icon = cfg.icon;
            return (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSignature className="w-5 h-5 text-slate-500" />
                    <div>
                      <div className="flex items-center gap-2"><p className="text-xs font-medium text-slate-900">{c.title}</p><span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${cfg.bg} ${cfg.color}`}><Icon className="w-2.5 h-2.5" /> {cfg.label}</span></div>
                      <p className="text-[9px] text-slate-500">{c.contract_number} — {c.supplier_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div><p className="text-[9px] text-slate-500">Monto</p><p className="text-xs font-bold text-slate-900">{fmt(c.total_amount)}</p></div>
                    <div><p className="text-[9px] text-slate-500">Inicio</p><p className="text-xs text-slate-600">{new Date(c.start_date).toLocaleDateString('es-CL')}</p></div>
                    {c.end_date && <div><p className="text-[9px] text-slate-500">Término</p><p className="text-xs text-slate-600">{new Date(c.end_date).toLocaleDateString('es-CL')}</p></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full dark:bg-slate-900 max-w- dark:bg-slate-9002xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">Nuevo Contrato</h2><button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Proveedor</label><select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"><option value="">Seleccionar...</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Título</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Inicio</label><input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Término</label><input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Monto</label><input type="number" value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-xs font-medium text-slate-700">Items</label><button onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"><Plus className="w-3 h-3 inline" /> Agregar</button></div>
                <div className="space-y-2">{form.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                    <input type="text" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Descripción" className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    <input type="number" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} placeholder="$0" className="w-24 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    {form.items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>}
                  </div>
                ))}</div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.supplier_id || !form.title} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"><Save className="w-3.5 h-3.5" /> Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
