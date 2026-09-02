'use client';

import { useState, useEffect } from 'react';
import { FileSignature, Plus, X, Save, Calendar, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Contract {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_tax_id: string;
  employee_name: string;
  contract_number: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  payment_terms: string;
  status: string;
  items: any[];
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  draft: { label: 'Borrador', color: 'text-foreground', bg: 'bg-muted', icon: Clock },
  active: { label: 'Activo', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle },
  completed: { label: 'Completado', color: 'text-blue-700', bg: 'bg-blue-50', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50', icon: AlertTriangle },
};

export default function SalesContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    customer_id: '', employee_id: '', title: '', description: '', start_date: new Date().toISOString().split('T')[0],
    end_date: '', total_amount: '', payment_terms: '', items: [{ description: '', quantity: '1', unit_price: '' }] as any[],
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const [contractsRes, custRes, empRes] = await Promise.all([
        fetch(`/api/companies/${companyId}/sales-contracts`),
        fetch(`/api/companies/${companyId}/customers`).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
        fetch(`/api/companies/${companyId}/employees`).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
      ]);
      if (contractsRes.ok) { const json = await contractsRes.json(); setContracts((json.data || []).map((c: any) => ({ ...c, items: typeof c.items === 'string' ? JSON.parse(c.items) : c.items || [] }))); }
      if (custRes.ok) { const json = await custRes.json(); setCustomers(json.data || []); }
      if (empRes.ok) { const json = await empRes.json(); setEmployees(json.data || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    const companyId = localStorage.getItem('company_id');
    const res = await fetch(`/api/companies/${companyId}/sales-contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, total_amount: parseFloat(form.total_amount) || 0, items: form.items.map(i => ({ ...i, quantity: parseInt(i.quantity) || 1, unit_price: parseFloat(i.unit_price) || 0 })) }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ customer_id: '', employee_id: '', title: '', description: '', start_date: new Date().toISOString().split('T')[0], end_date: '', total_amount: '', payment_terms: '', items: [{ description: '', quantity: '1', unit_price: '' }] });
      loadData();
    }
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: '1', unit_price: '' }] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx: number, field: string, value: string) => {
    const newItems = [...form.items];
    (newItems[idx] as any)[field] = value;
    setForm({ ...form, items: newItems });
  };

  const formatMoney = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSignature className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Contratos de Venta</span>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nuevo Contrato
        </button>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-12 bg-muted border border-dashed border-border rounded-xl">
          <FileSignature className="w-8 h-8 text-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Sin contratos registrados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contracts.map(c => {
            const cfg = statusConfig[c.status] || statusConfig.draft;
            const Icon = cfg.icon;
            return (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-border hover:bg-muted transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <FileSignature className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-foreground">{c.title}</p>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${cfg.bg} ${cfg.color}`}>
                          <Icon className="w-2.5 h-2.5" /> {cfg.label}
                        </span>
                      </div>
                      <p className="text-[9px] text-muted-foreground">{c.contract_number} — {c.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-[9px] text-muted-foreground">Monto</p>
                      <p className="text-xs font-bold text-foreground">{formatMoney(c.total_amount)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground">Inicio</p>
                      <p className="text-xs text-foreground">{new Date(c.start_date).toLocaleDateString('es-CL')}</p>
                    </div>
                    {c.end_date && (
                      <div>
                        <p className="text-[9px] text-muted-foreground">Término</p>
                        <p className="text-xs text-foreground">{new Date(c.end_date).toLocaleDateString('es-CL')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl w-full dark:bg-primary max-w- dark:bg-primary2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Nuevo Contrato</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Título</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Cliente</label>
                  <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                    <option value="">Seleccionar...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" rows={2} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Fecha Inicio</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Fecha Término</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Monto Total</label>
                  <input type="number" value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Condiciones de Pago</label>
                <input type="text" value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" placeholder="30 días, 50% adelanto..." />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-foreground">Items</label>
                  <button onClick={addItem} className="text-xs text-primary hover:text-primary font-medium"><Plus className="w-3 h-3 inline" /> Agregar</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted rounded-lg p-2">
                      <input type="text" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                        className="flex-1 bg-card border border-border rounded px-2 py-1 text-xs text-foreground dark:bg-card dark:border-border dark:text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20" placeholder="Descripción" />
                      <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                        className="w-16 bg-card border border-border rounded px-2 py-1 text-xs text-foreground dark:bg-card dark:border-border dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-primary/20" />
                      <input type="number" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)}
                        className="w-24 bg-card border border-border rounded px-2 py-1 text-xs text-foreground dark:bg-card dark:border-border dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-primary/20" placeholder="$0" />
                      {form.items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="bg-card border border-border hover:bg-muted text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.customer_id || !form.title}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
