'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Eye, X } from 'lucide-react';
import { toast } from 'sonner';

interface DebitNoteItem {
  product_id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
}

interface DebitNote {
  id: string;
  number: string;
  customer_name: string;
  customer_rut: string;
  invoice_number: string;
  reason: string;
  debit_date: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string;
  items?: DebitNoteItem[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Borrador', color: 'text-foreground', bg: 'bg-muted border-border' },
  issued: { label: 'Emitida', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  applied: { label: 'Aplicada', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  cancelled: { label: 'Anulada', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

export default function DebitNotes() {
  const [notes, setNotes] = useState<DebitNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    customer_id: '', invoice_id: '', reason: '', debit_date: new Date().toISOString().split('T')[0], notes: '',
  });
  const [items, setItems] = useState([{ product_id: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 19 }]);

  useEffect(() => { loadNotes(); loadCustomers(); loadProducts(); }, []);

  const loadNotes = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/debit-notes`);
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
      const res = await fetch(`/api/companies/${companyId}/debit-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
      });
      if (res.ok) {
        toast.success('Nota de debito creada');
        setShowCreate(false);
        setForm({ customer_id: '', invoice_id: '', reason: '', debit_date: new Date().toISOString().split('T')[0], notes: '' });
        setItems([{ product_id: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 19 }]);
        loadNotes();
      }
    } catch (e) { toast.error('Error al crear'); }
  };

  const handleIssue = async (noteId: string) => {
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/debit-notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'issued' }),
      });
      toast.success('Nota emitida');
      loadNotes();
    } catch (e) { toast.error('Error'); }
  };

  const handleCancel = async (noteId: string) => {
    if (!confirm('Anular nota de debito?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/debit-notes/${noteId}`, {
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

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Notas de Debito ({notes.length})</span>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva
        </button>
      </div>

      {showCreate && (
        <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Nueva Nota de Debito</span>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-muted rounded"><X className="w-3 h-3 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.customer_id} onChange={e => { setForm({ ...form, customer_id: e.target.value }); loadInvoices(e.target.value); }}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white">
              <option value="">Cliente...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.invoice_id} onChange={e => setForm({ ...form, invoice_id: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white">
              <option value="">Factura referenciada (opcional)</option>
              {invoices.map(i => <option key={i.id} value={i.id}>{i.invoice_number} - ${i.total_amount}</option>)}
            </select>
            <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
              className="col-span-2 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white"
              placeholder="Motivo de la nota de debito" />
            <input type="date" value={form.debit_date} onChange={e => setForm({ ...form, debit_date: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white" />
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white"
              placeholder="Notas" />
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Items</span>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select value={item.product_id} onChange={e => {
                  const prod = products.find(p => p.id === e.target.value);
                  updateItem(idx, 'product_id', e.target.value);
                  if (prod) { updateItem(idx, 'unit_price', prod.sale_price || 0); updateItem(idx, 'description', prod.name); }
                }} className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs focus:outline-none dark:bg-card dark:border-border dark:text-white focus:ring-2 focus:ring-primary/20">
                  <option value="">Producto...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} min={0.01}
                  className="w-16 bg-card border border-border rounded-lg px-2 py-2 text-xs text-right focus:outline-none dark:bg-card dark:border-border dark:text-white focus:ring-2 focus:ring-primary/20" />
                <input type="number" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', Number(e.target.value))}
                  className="w-24 bg-card border border-border rounded-lg px-2 py-2 text-xs text-right focus:outline-none dark:bg-card dark:border-border dark:text-white focus:ring-2 focus:ring-primary/20" />
                <button onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button onClick={addItem} className="text-xs text-primary hover:text-primary font-medium">+ Agregar item</button>
          </div>

          <div className="flex justify-end gap-6 text-sm">
            <span>Subtotal: <b>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></span>
            <span>IVA: <b>${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></span>
            <span className="font-bold">Total: <b className="text-lg">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></span>
          </div>

          <button onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Crear Nota de Debito
          </button>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12 bg-muted border border-dashed border-border rounded-xl">
          <FileText className="w-8 h-8 text-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Sin notas de debito</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden dark:bg-primary dark:border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Numero</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Factura Ref.</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Monto</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notes.map(note => {
                const cfg = statusConfig[note.status] || statusConfig.draft;
                return (
                  <tr key={note.id} className="border-b border-border hover:bg-muted">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{note.number}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{note.customer_name}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{note.invoice_number || '—'}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{new Date(note.debit_date).toLocaleDateString('es-CL')}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                    <td className="px-4 py-3 text-xs text-right font-bold text-foreground">${note.total_amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
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
