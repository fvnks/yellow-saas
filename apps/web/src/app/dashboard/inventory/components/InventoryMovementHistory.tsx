'use client';

import { useState, useEffect } from 'react';
import { History, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Settings, RefreshCw, Filter, Calendar, Package } from 'lucide-react';

interface Movement {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  warehouse_name: string;
  warehouse_code: string;
  type: string;
  quantity: number;
  unit_cost: number | null;
  total_cost: number | null;
  notes: string;
  reference_type: string | null;
  created_at: string;
}

const typeConfig: Record<string, { label: string; icon: typeof ArrowUpCircle; color: string; bg: string }> = {
  in: { label: 'Entrada', icon: ArrowDownCircle, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  out: { label: 'Salida', icon: ArrowUpCircle, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  transfer_in: { label: 'Transferencia Entrante', icon: ArrowRightLeft, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  transfer_out: { label: 'Transferencia Saliente', icon: ArrowRightLeft, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  adjustment: { label: 'Ajuste', icon: Settings, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  initial: { label: 'Inicial', icon: Package, color: 'text-foreground', bg: 'bg-muted border-border' },
};

export default function InventoryMovementHistory() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [productFilter, setProductFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  useEffect(() => { loadMovements(); }, [page, typeFilter, productFilter, warehouseFilter]);
  useEffect(() => { loadProducts(); loadWarehouses(); }, []);

  const loadMovements = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const params = new URLSearchParams({ limit: '50', offset: String(page * 50) });
      if (typeFilter) params.set('type', typeFilter);
      if (productFilter) params.set('product_id', productFilter);
      if (warehouseFilter) params.set('warehouse_id', warehouseFilter);

      const res = await fetch(`/api/companies/${companyId}/stock-movements?${params}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setMovements(data.movements || []);
        setTotal(data.total || 0);
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

  const formatCost = (val: number | null) => val != null ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            Historial de Movimientos ({total})
          </span>
        </div>
        <button onClick={() => loadMovements()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground rounded-lg text-xs font-medium transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-3 dark:bg-primary dark:border-border">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Filtros:</span>
          </div>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
            className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">Todos los tipos</option>
            {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={productFilter} onChange={e => { setProductFilter(e.target.value); setPage(0); }}
            className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 max-w-[200px]">
            <option value="">Todos los productos</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={warehouseFilter} onChange={e => { setWarehouseFilter(e.target.value); setPage(0); }}
            className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">Todas las bodegas</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : movements.length === 0 ? (
        <div className="text-center py-12 bg-muted border border-dashed border-border rounded-xl">
          <History className="w-8 h-8 text-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Sin movimientos registrados</p>
        </div>
      ) : (
        <div className="space-y-1">
          {movements.map(m => {
            const config = typeConfig[m.type] || typeConfig.in;
            const isPositive = ['in', 'transfer_in'].includes(m.type);
            return (
              <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl border ${config.bg} transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color.replace('text-', 'bg-').replace('-700', '-100')}`}>
                    <config.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.product_name}</p>
                    <p className="text-[9px] text-muted-foreground">{m.sku} | {m.warehouse_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                      {isPositive ? '+' : '-'}{m.quantity}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{config.label}</p>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="text-xs font-medium text-foreground">{formatCost(m.unit_cost)}</p>
                    <p className="text-[9px] text-muted-foreground">{formatCost(m.total_cost)}</p>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className="text-[9px] text-muted-foreground flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      {new Date(m.created_at).toLocaleDateString('es-CL')}
                    </p>
                    {m.notes && <p className="text-[9px] text-muted-foreground truncate max-w-[120px]">{m.notes}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {total > 50 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>Mostrando {page * 50 + 1}-{Math.min((page + 1) * 50, total)} de {total}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
              className="px-3 py-1 bg-card border border-border rounded-lg hover:bg-muted dark:bg-card dark:border-border dark:hover:bg-primary/90 disabled:opacity-50 transition-colors">
              Anterior
            </button>
            <button onClick={() => setPage(page + 1)} disabled={(page + 1) * 50 >= total}
              className="px-3 py-1 bg-card border border-border rounded-lg hover:bg-muted dark:bg-card dark:border-border dark:hover:bg-primary/90 disabled:opacity-50 transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
