'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Badge, Button, Select } from '@yellow-erp/ui';
import { ArrowLeft, Plus, RefreshCw, Search, Package } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface Adjustment {
  id: string;
  type: string;
  quantity: number;
  unit_cost: number | null;
  total_cost: number | null;
  notes: string | null;
  created_at: string;
  warehouse: { id: string; name: string; code: string };
  product: { id: string; name: string; sku: string };
}

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    api.getStockMovements({ type: 'adjustment', limit: '200' })
      .then((res: any) => {
        setAdjustments(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = adjustments.filter(a => {
    const matchSearch = !search ||
      a.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.product?.sku?.toLowerCase().includes(search.toLowerCase()) ||
      a.notes?.toLowerCase().includes(search.toLowerCase());
    const matchWarehouse = warehouseFilter === 'all' || a.warehouse?.id === warehouseFilter;
    return matchSearch && matchWarehouse;
  });

  const warehouses = (() => {
    const seen = new Set<string>();
    return adjustments
      .filter(a => { if (seen.has(a.warehouse?.id)) return false; seen.add(a.warehouse?.id); return true; })
      .map(a => ({ value: a.warehouse?.id, label: a.warehouse?.name }));
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inventory" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Ajustes de Stock</h1>
            <p className="text-sm text-muted-foreground mt-1">Historial de ajustes manuales de inventario</p>
          </div>
        </div>
        <Link href="/dashboard/inventory/adjustments/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Ajuste
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar por producto, SKU, notas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              />
            </div>
            {warehouses.length > 0 && (
              <Select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                options={[{ value: 'all', label: 'Todas las bodegas' }, ...warehouses]}
                className="w-full sm:w-48"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-pulse bg-slate-200 h-8 w-48 mx-auto rounded" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Sin ajustes registrados</p>
                <Link href="/dashboard/inventory/adjustments/new" className="inline-flex items-center gap-2 mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  <Plus className="w-4 h-4" /> Crear primer ajuste
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Bodega</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Motivo</th>
                    <th className="text-right px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Cantidad</th>
                    <th className="text-right px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Costo Unit.</th>
                    <th className="text-right px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const qty = Number(a.quantity);
                    const isPositive = qty > 0;
                    return (
                      <tr key={a.id} className="border-b border-slate-100 hover:bg-muted transition-colors">
                        <td className="px-6 py-3 text-xs text-foreground">
                          {new Date(a.created_at).toLocaleDateString('es-CL')} {new Date(a.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-xs font-medium text-foreground">{a.product?.name}</p>
                          <p className="text-[9px] text-muted-foreground">{a.product?.sku}</p>
                        </td>
                        <td className="px-6 py-3 text-xs text-foreground">{a.warehouse?.name}</td>
                        <td className="px-6 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{a.notes || '—'}</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPositive ? '+' : ''}{qty}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-xs text-muted-foreground">
                          {a.unit_cost ? `$${Number(a.unit_cost).toLocaleString('es-CL')}` : '—'}
                        </td>
                        <td className="px-6 py-3 text-right text-xs font-medium text-foreground">
                          {a.total_cost ? `$${Number(a.total_cost).toLocaleString('es-CL')}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
