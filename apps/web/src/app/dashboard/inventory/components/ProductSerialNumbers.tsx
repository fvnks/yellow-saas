'use client';

import { useState, useEffect } from 'react';
import { Hash, Plus, Search, XCircle, CheckCircle, AlertTriangle, Package, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface SerialNumber {
  id: string;
  product_name: string;
  sku: string;
  warehouse_name: string;
  serial_number: string;
  batch_number: string;
  status: string;
  notes: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; color: string; bg: string }> = {
  in_stock: { label: 'En Stock', icon: Package, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  sold: { label: 'Vendido', icon: CheckCircle, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  returned: { label: 'Devuelto', icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  defective: { label: 'Defectuoso', icon: XCircle, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  reserved: { label: 'Reservado', icon: Package, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
};

export default function ProductSerialNumbers() {
  const [serials, setSerials] = useState<SerialNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ product_id: '', warehouse_id: '', serial_number: '', batch_number: '', notes: '' });

  useEffect(() => { loadSerials(); loadProducts(); loadWarehouses(); }, [statusFilter]);

  const loadSerials = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('serial', search);

      const res = await fetch(`/api/companies/${companyId}/product-serials?${params}`);
      if (res.ok) {
        const json = await res.json();
        setSerials(Array.isArray(json.data) ? json.data : []);
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

  const loadWarehouses = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/warehouses`);
      if (res.ok) { const json = await res.json(); setWarehouses(Array.isArray(json.data) ? json.data : []); }
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!form.product_id || !form.warehouse_id || !form.serial_number) {
      toast.error('Complete todos los campos requeridos'); return;
    }
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/product-serials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Serial registrado');
        setShowCreate(false);
        setForm({ product_id: '', warehouse_id: '', serial_number: '', batch_number: '', notes: '' });
        loadSerials();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Error al registrar');
      }
    } catch (e) { toast.error('Error al registrar'); }
  };

  const handleStatus = async (serialId: string, status: string) => {
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/product-serials/${serialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success('Estado actualizado');
      loadSerials();
    } catch (e) { toast.error('Error'); }
  };

  const handleDelete = async (serialId: string) => {
    if (!confirm('Eliminar serial?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/product-serials/${serialId}`, { method: 'DELETE' });
      toast.success('Eliminado');
      loadSerials();
    } catch (e) { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Numeros de Serie ({serials.length})</span>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Registrar
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-3 dark:bg-primary dark:border-border">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadSerials()}
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Buscar por serial..." />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">Todos</option>
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {showCreate && (
        <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Registrar Serial</span>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-muted rounded">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white">
              <option value="">Producto...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={form.warehouse_id} onChange={e => setForm({ ...form, warehouse_id: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white">
              <option value="">Bodega...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <input type="text" value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white"
              placeholder="Numero de serie" />
            <input type="text" value={form.batch_number} onChange={e => setForm({ ...form, batch_number: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white"
              placeholder="Lote (opcional)" />
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="col-span-2 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white"
              placeholder="Notas" />
          </div>
          <button onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Registrar
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : serials.length === 0 ? (
        <div className="text-center py-12 bg-muted border border-dashed border-border rounded-xl">
          <Hash className="w-8 h-8 text-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Sin numeros de serie registrados</p>
        </div>
      ) : (
        <div className="space-y-1">
          {serials.map(s => {
            const cfg = statusConfig[s.status] || statusConfig.in_stock;
            return (
              <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border ${cfg.bg}`}>
                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-mono font-medium text-foreground">{s.serial_number}</p>
                    <p className="text-[9px] text-muted-foreground">{s.product_name} | {s.warehouse_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                  <select value={s.status} onChange={e => handleStatus(s.id, e.target.value)}
                    className="bg-card border border-border rounded px-2 py-1 text-[9px] focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button onClick={() => handleDelete(s.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
