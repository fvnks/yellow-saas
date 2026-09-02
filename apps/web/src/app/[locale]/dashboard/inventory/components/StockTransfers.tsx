'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, Plus, Package, MapPin, Clock, CheckCircle, XCircle, Truck, X } from 'lucide-react';
import { toast } from 'sonner';

interface StockTransfer {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  from_warehouse_id: string;
  from_warehouse_name: string;
  from_warehouse_code: string;
  to_warehouse_id: string;
  to_warehouse_name: string;
  to_warehouse_code: string;
  quantity: number;
  status: string;
  notes: string;
  created_at: string;
  completed_at: string | null;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending: { label: 'Pendiente', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  in_transit: { label: 'En Transito', icon: Truck, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  completed: { label: 'Completada', icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  cancelled: { label: 'Cancelada', icon: XCircle, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

export default function StockTransfers() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [form, setForm] = useState({ product_id: '', from_warehouse_id: '', to_warehouse_id: '', quantity: 1, notes: '' });

  useEffect(() => {
    loadTransfers();
    loadProducts();
    loadWarehouses();
  }, []);

  const loadTransfers = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/stock-transfers`);
      if (res.ok) {
        const json = await res.json();
        setTransfers(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/products?limit=200`);
      if (res.ok) {
        const json = await res.json();
        setProducts(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
  };

  const loadWarehouses = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/warehouses`);
      if (res.ok) {
        const json = await res.json();
        setWarehouses(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!form.product_id || !form.from_warehouse_id || !form.to_warehouse_id) {
      toast.error('Complete todos los campos');
      return;
    }
    if (form.from_warehouse_id === form.to_warehouse_id) {
      toast.error('Las bodegas deben ser diferentes');
      return;
    }
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/stock-transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Transferencia creada');
        setShowCreate(false);
        setForm({ product_id: '', from_warehouse_id: '', to_warehouse_id: '', quantity: 1, notes: '' });
        loadTransfers();
      }
    } catch (e) { toast.error('Error al crear transferencia'); }
  };

  const handleStatus = async (transferId: string, status: string) => {
    if (status === 'completed' && !confirm('Confirmar que la transferencia fue completada?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/stock-transfers/${transferId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Transferencia ${statusConfig[status]?.label.toLowerCase()}`);
        loadTransfers();
      }
    } catch (e) { toast.error('Error al actualizar'); }
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            Transferencias ({transfers.length})
          </span>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva Transferencia
        </button>
      </div>

      {showCreate && (
        <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Nueva Transferencia</span>
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
            <select value={form.from_warehouse_id} onChange={e => setForm({ ...form, from_warehouse_id: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white">
              <option value="">Origen...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <div className="flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
            </div>
            <select value={form.to_warehouse_id} onChange={e => setForm({ ...form, to_warehouse_id: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white">
              <option value="">Destino...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
              min={1} className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white" placeholder="Cantidad" />
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white" placeholder="Notas (opcional)" />
          </div>
          <button onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Crear Transferencia
          </button>
        </div>
      )}

      {transfers.length === 0 ? (
        <div className="text-center py-8 bg-muted border border-dashed border-border rounded-xl">
          <ArrowRightLeft className="w-8 h-8 text-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Sin transferencias registradas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transfers.map(t => {
            const config = statusConfig[t.status] || statusConfig.pending;
            return (
              <div key={t.id} className={`flex items-center justify-between p-3 rounded-xl border ${config.bg}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.product_name}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {t.from_warehouse_name} <ArrowRightLeft className="w-3 h-3 inline" /> {t.to_warehouse_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{t.quantity}</p>
                    <p className={`text-[9px] font-semibold ${config.color}`}>{config.label}</p>
                  </div>
                  {t.status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => handleStatus(t.id, 'in_transit')}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[9px] font-semibold hover:bg-blue-200">
                        Enviar
                      </button>
                      <button onClick={() => handleStatus(t.id, 'cancelled')}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-[9px] font-semibold hover:bg-red-200">
                        Cancelar
                      </button>
                    </div>
                  )}
                  {t.status === 'in_transit' && (
                    <button onClick={() => handleStatus(t.id, 'completed')}
                      className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[9px] font-semibold hover:bg-emerald-200">
                      Recibir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
