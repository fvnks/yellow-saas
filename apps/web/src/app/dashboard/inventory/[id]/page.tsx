'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Select } from '@yellow-erp/ui';
import { ArrowLeft, Package, Edit, Tag, BarChart3, MapPin, FileText, ArrowDownCircle, ArrowUpCircle, RefreshCw, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../../lib/api-client';

interface ProductData {
  id: string;
  sku: string;
  name: string;
  description: string;
  type: string;
  unit_of_measure: string;
  cost_price: number;
  sale_price: number;
  min_stock: number;
  max_stock: number;
  track_stock: boolean;
  barcode: string;
  is_active: boolean;
  category?: { id: string; name: string } | null;
  stock_levels?: {
    id: string;
    quantity: number;
    available_quantity: number;
    warehouse: { id: string; name: string; code: string };
  }[];
}

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  unit_cost: number | null;
  total_cost: number | null;
  notes: string | null;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
  warehouse: { id: string; name: string; code: string };
  product: { id: string; name: string; sku: string };
}

const movementTypeConfig: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral'; icon: typeof ArrowUpCircle }> = {
  in: { label: 'Entrada', variant: 'success', icon: ArrowDownCircle },
  out: { label: 'Salida', variant: 'danger', icon: ArrowUpCircle },
  adjustment: { label: 'Ajuste', variant: 'warning', icon: RefreshCw },
  transfer_in: { label: 'Transferencia Entrada', variant: 'info', icon: ArrowDownCircle },
  transfer_out: { label: 'Transferencia Salida', variant: 'info', icon: ArrowUpCircle },
  initial: { label: 'Inicial', variant: 'neutral', icon: Package },
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'kardex'>('details');

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementTypeFilter, setMovementTypeFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    api.getProduct(id)
      .then((data) => {
        setProduct(data as unknown as ProductData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeTab !== 'kardex') return;
    setMovementsLoading(true);
    const api = getApiClient();
    api.getStockMovements({ product: id, limit: '200' })
      .then((res: any) => {
        setMovements(res.data || []);
        setMovementsLoading(false);
      })
      .catch(() => setMovementsLoading(false));
  }, [activeTab, id]);

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      if (movementTypeFilter !== 'all' && m.type !== movementTypeFilter) return false;
      if (warehouseFilter !== 'all' && m.warehouse?.id !== warehouseFilter) return false;
      return true;
    });
  }, [movements, movementTypeFilter, warehouseFilter]);

  const movementsWithBalance = useMemo(() => {
    let balance = 0;
    return [...filteredMovements].reverse().map(m => {
      const qty = Number(m.quantity);
      balance += qty;
      return { ...m, balance };
    }).reverse();
  }, [filteredMovements]);

  const warehouses = useMemo(() => {
    const seen = new Set<string>();
    return movements
      .filter(m => { if (seen.has(m.warehouse?.id)) return false; seen.add(m.warehouse?.id); return true; })
      .map(m => ({ value: m.warehouse?.id, label: m.warehouse?.name }));
  }, [movements]);

  if (loading) {
    return <div className="space-y-6">{[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-slate-200 h-32 rounded-xl" />)}</div>;
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/bodega" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <p className="text-sm text-slate-500">Producto no encontrado</p>
        </div>
      </div>
    );
  }

  const totalStock = (product.stock_levels || []).reduce((sum, sl) => sum + (sl.quantity || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/bodega" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
            <p className="text-sm text-slate-500 mt-1">SKU: {product.sku}</p>
          </div>
        </div>
        <Link href={`/dashboard/inventory/${id}/edit`}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center">
          <Edit className="w-4 h-4" /> Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock Total</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalStock}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Precio Venta</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${(product.sale_price || 0).toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Tag className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Precio Costo</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${(product.cost_price || 0).toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex">
            {[
              { id: 'details' as const, label: 'Detalle', icon: FileText },
              { id: 'kardex' as const, label: 'Kardex', icon: ArrowUpDown },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'details' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Informacion del Producto</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</p>
                    <p className="text-sm text-slate-900 mt-1">{product.sku}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Codigo de Barras</p>
                    <p className="text-sm text-slate-900 mt-1">{product.barcode || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</p>
                    <p className="text-sm text-slate-900 mt-1 capitalize">{product.type}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Unidad</p>
                    <p className="text-sm text-slate-900 mt-1">{product.unit_of_measure}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Categoria</p>
                    <p className="text-sm text-slate-900 mt-1">{product.category?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</p>
                    <Badge variant={product.is_active ? 'success' : 'neutral'}>
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                {product.description && (
                  <div className="mt-4">
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripcion</p>
                    <p className="text-sm text-slate-700 mt-1">{product.description}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Stock por Bodega</h3>
                {(product.stock_levels || []).length > 0 ? (
                  <div className="space-y-3">
                    {product.stock_levels!.map((sl) => (
                      <div key={sl.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{sl.warehouse?.name}</p>
                            <p className="text-[9px] text-slate-500">{sl.warehouse?.code}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">{sl.quantity}</p>
                          <p className="text-[9px] text-slate-500">disponible: {sl.available_quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">Sin stock registrado</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kardex' && (
          <div>
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={movementTypeFilter}
                  onChange={(e) => setMovementTypeFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos los tipos' },
                    { value: 'in', label: 'Entradas' },
                    { value: 'out', label: 'Salidas' },
                    { value: 'adjustment', label: 'Ajustes' },
                    { value: 'transfer_in', label: 'Transferencias Entrada' },
                    { value: 'transfer_out', label: 'Transferencias Salida' },
                    { value: 'initial', label: 'Inicial' },
                  ]}
                  className="w-full sm:w-48"
                />
                {warehouses.length > 0 && (
                  <Select
                    value={warehouseFilter}
                    onChange={(e) => setWarehouseFilter(e.target.value)}
                    options={[{ value: 'all', label: 'Todas las bodegas' }, ...warehouses]}
                    className="w-full sm:w-48"
                  />
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              {movementsLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-pulse bg-slate-200 h-8 w-48 mx-auto rounded" />
                </div>
              ) : movementsWithBalance.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Sin movimientos registrados</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                      <th className="text-left px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                      <th className="text-left px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                      <th className="text-left px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Notas</th>
                      <th className="text-right px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Entradas</th>
                      <th className="text-right px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Salidas</th>
                      <th className="text-right px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo Unit.</th>
                      <th className="text-right px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movementsWithBalance.map((m) => {
                      const config = movementTypeConfig[m.type] || movementTypeConfig.initial;
                      const qty = Number(m.quantity);
                      const isEntry = qty > 0;
                      return (
                        <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 text-xs text-slate-700">
                            {new Date(m.created_at).toLocaleDateString('es-CL')} {new Date(m.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-3">
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </td>
                          <td className="px-6 py-3 text-xs text-slate-700">{m.warehouse?.name}</td>
                          <td className="px-6 py-3 text-xs text-slate-500 max-w-[200px] truncate">{m.notes || '—'}</td>
                          <td className="px-6 py-3 text-right text-xs font-medium text-emerald-600">
                            {isEntry ? `+${qty}` : ''}
                          </td>
                          <td className="px-6 py-3 text-right text-xs font-medium text-rose-600">
                            {!isEntry ? qty : ''}
                          </td>
                          <td className="px-6 py-3 text-right text-xs text-slate-500">
                            {m.unit_cost ? `$${Number(m.unit_cost).toLocaleString('es-CL')}` : '—'}
                          </td>
                          <td className="px-6 py-3 text-right text-xs font-bold text-slate-900">
                            {m.balance}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
