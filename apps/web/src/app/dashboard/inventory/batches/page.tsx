'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Trash2, Package } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Batch {
  id: string; batch_number: string; quantity: number; status: string;
  expiry_date: string | null; manufacturing_date: string | null;
  product: { id: string; name: string; sku: string };
  warehouse: { id: string; name: string; code: string };
  created_at: string;
}

const statusMap: Record<string, { bg: string; text: string; border: string; label: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Activo' },
  expired: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Vencido' },
  consumed: { bg: 'bg-muted', text: 'text-slate-600', border: 'border-border', label: 'Consumido' },
};

export default function BatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ product_id: '', warehouse_id: '', batch_number: '', quantity: '0', expiry_date: '', manufacturing_date: '', notes: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  useEffect(() => { loadBatches(); loadOptions(); }, [search]);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '100' };
      if (search) params.search = search;
      const res = await api.getProductBatches(params);
      setBatches(res.data || []);
    } catch (e) { toast.error('Error al cargar lotes'); }
    setLoading(false);
  };

  const loadOptions = async () => {
    try {
      const api = getApiClient();
      const [pRes, wRes] = await Promise.all([
        api.getProducts({ limit: '200' }),
        api.getWarehouses({ limit: '100' }),
      ]);
      setProducts(pRes.data || []);
      setWarehouses(wRes.data || []);
    } catch (e) { toast.error('Error al cargar opciones'); }
  };

  const handleCreate = async () => {
    if (!form.product_id || !form.warehouse_id || !form.batch_number) return;
    try {
      const api = getApiClient();
      await api.createProductBatch({
        product_id: form.product_id, warehouse_id: form.warehouse_id,
        batch_number: form.batch_number, quantity: Number(form.quantity),
        expiry_date: form.expiry_date || undefined, manufacturing_date: form.manufacturing_date || undefined,
        notes: form.notes || undefined,
      });
      setShowNew(false);
      setForm({ product_id: '', warehouse_id: '', batch_number: '', quantity: '0', expiry_date: '', manufacturing_date: '', notes: '' });
      loadBatches();
    } catch (e) { toast.error('Error al crear lote'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este lote?')) return;
    try { await getApiClient().deleteProductBatch(id); loadBatches(); } catch (e) { toast.error('Error al eliminar lote'); }
  };

  const filtered = batches.filter(b =>
    b.batch_number.toLowerCase().includes(search.toLowerCase()) ||
    b.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Lotes / Batches</h1>
            <p className="text-sm text-muted-foreground mt-1">Control de lotes y vencimientos</p>
          </div>
        </div>
        <button onClick={() => setShowNew(true)} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Lote
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar lote, producto..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
        </div>
      </div>

      {showNew && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
          <h3 className="text-sm font-semibold text-foreground mb-4">Nuevo Lote</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Producto *</label>
              <select value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Seleccionar...</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Bodega *</label>
              <select value={form.warehouse_id} onChange={e => setForm({...form, warehouse_id: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Seleccionar...</option>
                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Numero de Lote *</label>
              <input type="text" value={form.batch_number} onChange={e => setForm({...form, batch_number: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="LOT-001" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Cantidad</label>
              <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Fecha de Vencimiento</label>
              <input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Fecha de Fabricacion</label>
              <input type="date" value={form.manufacturing_date} onChange={e => setForm({...form, manufacturing_date: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowNew(false)} className="bg-card border border-border hover:bg-muted text-foreground dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
            <button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Crear Lote</button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Lote</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Bodega</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Cantidad</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Vencimiento</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-10 bg-muted rounded-lg animate-pulse" /></td></tr>)
              ) : filtered.map(b => {
                const st = statusMap[b.status] || statusMap.active;
                return (
                  <tr key={b.id} className="border-b border-slate-100 hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-foreground">{b.batch_number}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{b.product?.name}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{b.warehouse?.name}</td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-foreground">{b.quantity}</td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                      {b.expiry_date ? new Date(b.expiry_date).toLocaleDateString('es-CL') : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.bg} ${st.text} border ${st.border}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button onClick={() => handleDelete(b.id)} className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No hay lotes registrados</div>}
        </div>
      </div>
    </div>
  );
}
