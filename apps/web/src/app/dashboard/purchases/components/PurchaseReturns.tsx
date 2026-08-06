'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, X, Save, RotateCcw } from 'lucide-react';

export default function PurchaseReturns() {
  const [returns, setReturns] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    supplier_id: '', return_date: new Date().toISOString().split('T')[0], reason: '', notes: '',
    items: [{ product_name: '', quantity: '1', unit_price: '', reason: '' }] as any[],
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const companyId = localStorage.getItem('company_id');
    const [retRes, supRes] = await Promise.all([
      fetch(`/api/companies/${companyId}/purchase-returns`),
      fetch(`/api/companies/${companyId}/suppliers`).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
    ]);
    if (retRes.ok) { const j = await retRes.json(); setReturns(j.data || []); }
    if (supRes.ok) { const j = await supRes.json(); setSuppliers(j.data || []); }
    setLoading(false);
  };

  const handleSave = async () => {
    const companyId = localStorage.getItem('company_id');
    const res = await fetch(`/api/companies/${companyId}/purchase-returns`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowForm(false); loadData(); }
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { product_name: '', quantity: '1', unit_price: '', reason: '' }] });
  const removeItem = (i: number) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i: number, k: string, v: string) => { const n = [...form.items]; (n[i] as any)[k] = v; setForm({ ...form, items: n }); };

  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50' },
    approved: { label: 'Aprobada', color: 'text-blue-700', bg: 'bg-blue-50' },
    shipped: { label: 'Enviada', color: 'text-indigo-700', bg: 'bg-indigo-50' },
    received: { label: 'Recibida', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    cancelled: { label: 'Cancelada', color: 'text-red-700', bg: 'bg-red-50' },
  };

  const filtered = returns.filter(r => {
    return r.return_number?.toLowerCase().includes(search.toLowerCase()) || r.supplier_name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Devoluciones de Compra</span>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva Devolución
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="search" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden dark:bg-primary dark:border-slate-800">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">N° Devolución</th>
            <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">Proveedor</th>
            <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">Fecha</th>
            <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">Monto</th>
            <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">Estado</th>
          </tr></thead>
          <tbody>
            {filtered.map(r => {
              const cfg = statusCfg[r.status] || statusCfg.pending;
              return (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-muted transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-foreground">{r.return_number}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{r.supplier_name}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{r.return_date?.split('T')[0]}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium text-foreground">{fmt(parseFloat(r.total_amount))}</td>
                  <td className="px-4 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-xs text-muted-foreground">Sin devoluciones</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl w-full dark:bg-primary max-w- dark:bg-primary2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Nueva Devolución</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-foreground mb-1">Proveedor</label>
                  <select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                    <option value="">Seleccionar...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>
                <div><label className="block text-xs font-medium text-foreground mb-1">Fecha</label>
                  <input type="date" value={form.return_date} onChange={e => setForm({ ...form, return_date: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" /></div>
              </div>
              <div><label className="block text-xs font-medium text-foreground mb-1">Motivo</label>
                <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" placeholder="Producto defectuoso, error..." /></div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-xs font-medium text-foreground">Items</label>
                  <button onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"><Plus className="w-3 h-3 inline" /> Agregar</button></div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted rounded-lg p-2">
                      <input type="text" value={item.product_name} onChange={e => updateItem(i, 'product_name', e.target.value)} placeholder="Producto"
                        className="flex-1 bg-card border border-border rounded px-2 py-1 text-xs text-foreground dark:bg-slate-800 dark:border-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/20" />
                      <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Cant."
                        className="w-16 bg-card border border-border rounded px-2 py-1 text-xs text-foreground dark:bg-slate-800 dark:border-slate-700 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-primary/20" />
                      <input type="number" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} placeholder="$0"
                        className="w-24 bg-card border border-border rounded px-2 py-1 text-xs text-foreground dark:bg-slate-800 dark:border-slate-700 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-primary/20" />
                      {form.items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="bg-card border border-border hover:bg-muted text-foreground dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.supplier_id}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
