'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, X, Save, FileText, DollarSign } from 'lucide-react';

export default function PurchaseInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    supplier_id: '', invoice_number: '', invoice_date: new Date().toISOString().split('T')[0], due_date: '', purchase_order_id: '', payment_terms: '', notes: '',
    items: [{ description: '', quantity: '1', unit_price: '', discount_pct: '0', tax_pct: '19' }] as any[],
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const companyId = localStorage.getItem('company_id');
    const [invRes, supRes] = await Promise.all([
      fetch(`/api/companies/${companyId}/purchase-invoices`),
      fetch(`/api/companies/${companyId}/suppliers`).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
    ]);
    if (invRes.ok) { const j = await invRes.json(); setInvoices(j.data || []); }
    if (supRes.ok) { const j = await supRes.json(); setSuppliers(j.data || []); }
    setLoading(false);
  };

  const handleSave = async () => {
    const companyId = localStorage.getItem('company_id');
    const res = await fetch(`/api/companies/${companyId}/purchase-invoices`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowForm(false); loadData(); }
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: '1', unit_price: '', discount_pct: '0', tax_pct: '19' }] });
  const removeItem = (i: number) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i: number, k: string, v: string) => { const n = [...form.items]; (n[i] as any)[k] = v; setForm({ ...form, items: n }); };

  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Borrador', color: 'text-slate-600', bg: 'bg-slate-100' },
    pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50' },
    partial: { label: 'Parcial', color: 'text-blue-700', bg: 'bg-blue-50' },
    paid: { label: 'Pagada', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    overdue: { label: 'Vencida', color: 'text-red-700', bg: 'bg-red-50' },
    cancelled: { label: 'Cancelada', color: 'text-red-700', bg: 'bg-red-50' },
  };

  const filtered = invoices.filter(i => {
    const matchSearch = i.invoice_number?.toLowerCase().includes(search.toLowerCase()) || i.supplier_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Facturas de Compra</span>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva Factura
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="search" placeholder="Buscar por N° factura, proveedor..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option value="all">Todos</option>
          <option value="draft">Borrador</option><option value="pending">Pendiente</option><option value="partial">Parcial</option>
          <option value="paid">Pagada</option><option value="overdue">Vencida</option><option value="cancelled">Cancelada</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <table className="w-full">
          <thead><tr className="border-b border-slate-200">
            <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">N° Factura</th>
            <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Proveedor</th>
            <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Fecha</th>
            <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Vencimiento</th>
            <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Total</th>
            <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Pagado</th>
            <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Saldo</th>
            <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Estado</th>
          </tr></thead>
          <tbody>
            {filtered.map(inv => {
              const cfg = statusCfg[inv.status] || statusCfg.pending;
              return (
                <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">{inv.supplier_name}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{inv.invoice_date?.split('T')[0]}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{inv.due_date?.split('T')[0] || '-'}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium text-slate-900">{fmt(parseFloat(inv.total_amount))}</td>
                  <td className="px-4 py-3 text-xs text-right text-emerald-600">{fmt(parseFloat(inv.paid_amount))}</td>
                  <td className="px-4 py-3 text-xs text-right font-bold text-slate-900">{fmt(parseFloat(inv.total_amount) - parseFloat(inv.paid_amount))}</td>
                  <td className="px-4 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-xs text-slate-400">Sin facturas</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full dark:bg-slate-900 max-w- dark:bg-slate-9002xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Nueva Factura de Compra</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Proveedor</label>
                  <select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Seleccionar...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">N° Factura</label>
                  <input type="text" value={form.invoice_number} onChange={e => setForm({ ...form, invoice_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Fecha Factura</label>
                  <input type="date" value={form.invoice_date} onChange={e => setForm({ ...form, invoice_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Fecha Vencimiento</label>
                  <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-xs font-medium text-slate-700">Items</label>
                  <button onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"><Plus className="w-3 h-3 inline" /> Agregar</button></div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                      <input type="text" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Descripción"
                        className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Cant."
                        className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      <input type="number" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} placeholder="$0"
                        className="w-24 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      {form.items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.supplier_id || !form.invoice_number}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
