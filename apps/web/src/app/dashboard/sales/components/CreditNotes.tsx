'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Eye, Printer, Download, X } from 'lucide-react';
import { toast } from 'sonner';

interface CreditNoteItem {
  product_id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
}

interface CreditNote {
  id: string;
  number: string;
  customer_name: string;
  customer_rut: string;
  invoice_number: string;
  reason: string;
  credit_date: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string;
  items?: CreditNoteItem[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Borrador', color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' },
  issued: { label: 'Emitida', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  applied: { label: 'Aplicada', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  cancelled: { label: 'Anulada', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

export default function CreditNotes() {
  const [notes, setNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedNote, setSelectedNote] = useState<CreditNote | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    customer_id: '', invoice_id: '', reason: '', credit_date: new Date().toISOString().split('T')[0], notes: '',
  });
  const [items, setItems] = useState([{ product_id: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 19 }]);

  useEffect(() => { loadNotes(); loadCustomers(); loadProducts(); }, []);

  const loadNotes = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/credit-notes`);
      if (res.ok) { const json = await res.json(); setNotes(Array.isArray(json.data) ? json.data : []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadCustomers = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/customers`);
      if (res.ok) { const json = await res.json(); setCustomers(Array.isArray(json.data) ? json.data : []); }
    } catch (e) { console.error(e); }
  };

  const loadProducts = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/products?limit=200`);
      if (res.ok) { const json = await res.json(); setProducts(Array.isArray(json.data) ? json.data : []); }
    } catch (e) { console.error(e); }
  };

  const loadInvoices = async (customerId: string) => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/invoices?customer_id=${customerId}`);
      if (res.ok) { const json = await res.json(); setInvoices(Array.isArray(json.data) ? json.data : []); }
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!form.customer_id || !form.reason) { toast.error('Cliente y motivo requeridos'); return; }
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/credit-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
      });
      if (res.ok) {
        toast.success('Nota de credito creada');
        setShowCreate(false);
        setForm({ customer_id: '', invoice_id: '', reason: '', credit_date: new Date().toISOString().split('T')[0], notes: '' });
        setItems([{ product_id: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 19 }]);
        loadNotes();
      }
    } catch (e) { toast.error('Error al crear'); }
  };

  const handleIssue = async (noteId: string) => {
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/credit-notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'issued' }),
      });
      toast.success('Nota emitida');
      loadNotes();
    } catch (e) { toast.error('Error'); }
  };

  const handleCancel = async (noteId: string) => {
    if (!confirm('Anular nota de credito?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/credit-notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      toast.success('Nota anulada');
      loadNotes();
    } catch (e) { toast.error('Error'); }
  };

  const addItem = () => setItems([...items, { product_id: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 19 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[idx] as any)[field] = value;
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price * (1 - item.discount_percent / 100), 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  const handleViewDetail = async (noteId: string) => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/credit-notes/${noteId}`);
      if (res.ok) { const json = await res.json(); setSelectedNote(json.data); }
    } catch (e) { toast.error('Error'); }
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Notas de Credito ({notes.length})</span>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva
        </button>
      </div>

      {showCreate && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Nueva Nota de Credito</span>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-slate-200 rounded"><X className="w-3 h-3 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.customer_id} onChange={e => { setForm({ ...form, customer_id: e.target.value }); loadInvoices(e.target.value); }}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="">Cliente...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.invoice_id} onChange={e => setForm({ ...form, invoice_id: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="">Factura referenciada (opcional)</option>
              {invoices.map(i => <option key={i.id} value={i.id}>{i.invoice_number} - ${i.total_amount}</option>)}
            </select>
            <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
              className="col-span-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              placeholder="Motivo de la nota de credito" />
            <input type="date" value={form.credit_date} onChange={e => setForm({ ...form, credit_date: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              placeholder="Notas" />
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Items</span>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select value={item.product_id} onChange={e => {
                  const prod = products.find(p => p.id === e.target.value);
                  updateItem(idx, 'product_id', e.target.value);
                  if (prod) { updateItem(idx, 'unit_price', prod.sale_price || 0); updateItem(idx, 'description', prod.name); }
                }} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="">Producto...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} min={0.01}
                  className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-right focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                <input type="number" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', Number(e.target.value))}
                  className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-right focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                <button onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Agregar item</button>
          </div>

          <div className="flex justify-end gap-6 text-sm">
            <span>Subtotal: <b>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></span>
            <span>IVA: <b>${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></span>
            <span className="font-bold">Total: <b className="text-lg">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></span>
          </div>

          <button onClick={handleCreate}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Crear Nota de Credito
          </button>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Sin notas de credito</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Numero</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Factura Ref.</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notes.map(note => {
                const cfg = statusConfig[note.status] || statusConfig.draft;
                return (
                  <tr key={note.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{note.number}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{note.customer_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{note.invoice_number || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{new Date(note.credit_date).toLocaleDateString('es-CL')}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                    <td className="px-4 py-3 text-xs text-right font-bold text-slate-900">${note.total_amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleViewDetail(note.id)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Eye className="w-3.5 h-3.5 text-slate-500" /></button>
                        {note.status === 'draft' && (
                          <button onClick={() => handleIssue(note.id)} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[9px] font-semibold hover:bg-blue-200">Emitir</button>
                        )}
                        {note.status === 'issued' && (
                          <button onClick={() => handleCancel(note.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-[9px] font-semibold hover:bg-red-200">Anular</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
