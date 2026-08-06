'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, Plus, Trash2, X, Scale } from 'lucide-react';
import { toast } from 'sonner';

interface UomConversion {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  from_uom: string;
  to_uom: string;
  conversion_factor: number;
  is_base: boolean;
}

export default function UomConversions() {
  const [conversions, setConversions] = useState<UomConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ product_id: '', from_uom: '', to_uom: '', conversion_factor: 1, is_base: false });

  useEffect(() => { loadConversions(); loadProducts(); }, []);

  const loadConversions = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/uom-conversions`);
      if (res.ok) {
        const json = await res.json();
        setConversions(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/products?limit=200`);
      if (res.ok) { const json = await res.json(); setProducts(Array.isArray(json.data) ? json.data : []); }
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!form.product_id || !form.from_uom || !form.to_uom) {
      toast.error('Complete todos los campos'); return;
    }
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/uom-conversions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Conversion creada');
        setShowCreate(false);
        setForm({ product_id: '', from_uom: '', to_uom: '', conversion_factor: 1, is_base: false });
        loadConversions();
      }
    } catch (e) { toast.error('Error al crear'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar conversion?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/uom-conversions/${id}`, { method: 'DELETE' });
      toast.success('Eliminada');
      loadConversions();
    } catch (e) { toast.error('Error'); }
  };

  const grouped = conversions.reduce((acc: Record<string, UomConversion[]>, c) => {
    if (!acc[c.product_id]) acc[c.product_id] = [];
    acc[c.product_id].push(c);
    return acc;
  }, {});

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            Conversiones UOM ({conversions.length})
          </span>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva
        </button>
      </div>

      {showCreate && (
        <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Crear Conversion</span>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-slate-200 rounded">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="">Producto...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <input type="text" value={form.from_uom} onChange={e => setForm({ ...form, from_uom: e.target.value })}
                className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                placeholder="Desde (ej: Caja)" />
              <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
              <input type="text" value={form.to_uom} onChange={e => setForm({ ...form, to_uom: e.target.value })}
                className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                placeholder="Hasta (ej: Unidad)" />
            </div>
            <input type="number" value={form.conversion_factor} onChange={e => setForm({ ...form, conversion_factor: Number(e.target.value) })}
              min={0.001} step={0.001}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              placeholder="Factor de conversion" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_base} onChange={e => setForm({ ...form, is_base: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-primary/20" />
              <span className="text-xs text-foreground">Unidad base</span>
            </label>
          </div>
          <button onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Crear Conversion
          </button>
        </div>
      )}

      {conversions.length === 0 ? (
        <div className="text-center py-12 bg-muted border border-dashed border-slate-300 rounded-xl">
          <Scale className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Sin conversiones de unidades configuradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([productId, items]) => (
            <div key={productId} className="bg-card border border-border rounded-xl overflow-hidden dark:bg-primary dark:border-slate-800">
              <div className="px-4 py-3 border-b border-slate-100 bg-muted">
                <p className="text-sm font-medium text-foreground">{items[0].product_name}</p>
                <p className="text-[9px] text-muted-foreground">{items[0].sku}</p>
              </div>
              <div className="p-3 space-y-2">
                {items.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-card border border-border rounded text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 font-medium text-foreground dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">{c.from_uom}</span>
                      <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="px-2 py-1 bg-card border border-border rounded text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 font-medium text-foreground dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">{c.to_uom}</span>
                      <span className="text-xs text-muted-foreground">= {c.conversion_factor}</span>
                      {c.is_base && (
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-semibold rounded">BASE</span>
                      )}
                    </div>
                    <button onClick={() => handleDelete(c.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
