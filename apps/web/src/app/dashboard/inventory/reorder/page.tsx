'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge } from '@yellow-erp/ui';
import { ArrowLeft, Download, RefreshCw, Truck, AlertTriangle, Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface ReorderItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  available_quantity: number;
  reorder_point: number;
  reorder_qty: number;
  lead_time_days: number;
  product: { id: string; name: string; sku: string; unit_of_measure: string; cost_price: number };
  warehouse: { id: string; name: string; code: string };
  suggested_qty: number;
  estimated_cost: number;
}

export default function ReorderSuggestionsPage() {
  const [items, setItems] = useState<ReorderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ warehouse_id: 'all', onlyCritical: true });
  const [warehouses, setWarehouses] = useState<{ value: string; label: string }[]>([]);
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [creatingPO, setCreatingPO] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter.warehouse_id, filter.onlyCritical]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const api = getApiClient();
      const [suggestionsRes, whRes] = await Promise.all([
        api.getReorderSuggestions({ 
          warehouse: filter.warehouse_id === 'all' ? '' : filter.warehouse_id,
          only_critical: filter.onlyCritical.toString(),
        }),
        api.getWarehouses(),
      ]);
      setItems(suggestionsRes.data || []);
      const whList = (whRes.data || []).map((w: any) => ({ value: w.id, label: w.name }));
      setWarehouses(whList);
    } catch (err: any) {
      setError(err.message || 'Error cargando sugerencias');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(i => i.id));
    }
  };

  const handleCreatePO = async () => {
    if (selectedItems.length === 0) return;
    setCreatingPO(true);
    setError('');
    try {
      const selected = items.filter(i => selectedItems.includes(i.id));
      const api = getApiClient();
      
      for (const item of selected) {
        await api.createPurchaseOrder({
          supplier_id: '', // Se debe seleccionar proveedor
          warehouse_id: item.warehouse_id,
          expected_date: new Date(Date.now() + (item.lead_time_days || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: [{
            product_id: item.product_id,
            quantity: item.suggested_qty,
            unit_price: item.product.cost_price,
            discount_percent: 0,
            tax_rate: 0,
          }],
        });
      }
      setSelectedItems([]);
      setShowCreatePO(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error creando OC');
    } finally {
      setCreatingPO(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Producto', 'SKU', 'Bodega', 'Stock Actual', 'Punto Reorden', 'Sugerido', 'Lead Time (días)', 'Costo Estimado'];
    const rows = items.map(i => [i.product.name, i.product.sku, i.warehouse.name, i.available_quantity, i.reorder_point, i.suggested_qty, i.lead_time_days, i.estimated_cost]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sugerencias-reposicion.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const totalSuggested = items.reduce((sum, i) => sum + i.suggested_qty, 0);
  const totalEstimatedCost = items.reduce((sum, i) => sum + i.estimated_cost, 0);
  const criticalCount = items.filter(i => i.available_quantity === 0).length;

  if (loading) return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-200 h-32 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sugerencias de Reposición</h1>
          <p className="text-sm text-slate-500 mt-1">Productos por debajo del punto de reorden</p>
        </div>
        <Link href="/dashboard/bodega" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle>Filtros</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filter.warehouse_id} onChange={e => setFilter({...filter, warehouse_id: e.target.value})} options={[{value:'all', label:'Todas las bodegas'}, ...warehouses]} className="w-48" />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={filter.onlyCritical} onChange={e => setFilter({...filter, onlyCritical: e.target.checked})} className="rounded border-slate-300" />
              Solo críticos (stock = 0)
            </label>
            <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-2" /> Refrescar</Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" /> CSV</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Productos a Reponer</p><p className="text-2xl font-bold text-slate-900 mt-1">{items.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Sin Stock (Críticos)</p><p className="text-2xl font-bold text-rose-600 mt-1">{criticalCount}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Unidades Sugeridas</p><p className="text-2xl font-bold text-slate-900 mt-1">{totalSuggested.toLocaleString('es-CL')}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo Estimado</p><p className="text-2xl font-bold text-emerald-600 mt-1">${totalEstimatedCost.toLocaleString('es-CL')}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Seleccionados</p><p className="text-2xl font-bold text-indigo-600 mt-1">{selectedItems.length}</p></CardContent></Card>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No hay productos que requieran reposición</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedItems.length === items.length && items.length > 0} onChange={handleSelectAll} className="rounded border-slate-300" />
                    <span className="text-sm">Seleccionar todo ({items.length})</span>
                  </label>
                  {selectedItems.length > 0 && (
                    <Button variant="secondary" size="sm" onClick={() => setShowCreatePO(true)} disabled={creatingPO}>
                      <ShoppingCart className="w-4 h-4 mr-2" /> Crear OC para {selectedItems.length} items
                    </Button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock Actual</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Punto Reorden</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Sugerido</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Lead Time</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo Estimado</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleToggleSelect(item.id)} className="rounded border-slate-300 mr-2" />
                          <Link href={`/dashboard/inventory/${item.product_id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                            {item.product.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.product.sku}</td>
                        <td className="px-4 py-3 text-xs text-slate-700">{item.warehouse.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold ${item.available_quantity === 0 ? 'text-rose-600' : item.available_quantity <= item.reorder_point ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {item.available_quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-slate-500">{item.reorder_point}</td>
                        <td className="px-4 py-3 text-center text-xs font-bold text-indigo-600">{item.suggested_qty}</td>
                        <td className="px-4 py-3 text-center text-xs text-slate-500">{item.lead_time_days || '—'} días</td>
                        <td className="px-4 py-3 text-right text-xs font-bold text-slate-900">${item.estimated_cost.toLocaleString('es-CL')}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={item.available_quantity === 0 ? 'danger' : 'warning'}>
                            {item.available_quantity === 0 ? 'Sin Stock' : 'Bajo Mínimo'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showCreatePO && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Crear Órdenes de Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">Se crearán {selectedItems.length} órdenes de compra (una por bodega) con los items seleccionados.</p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowCreatePO(false)}>Cancelar</Button>
                <Button onClick={handleCreatePO} disabled={creatingPO}>
                  {creatingPO ? 'Creando...' : 'Crear Órdenes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}