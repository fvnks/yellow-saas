'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Badge, Button, Select } from '@yellow-erp/ui';
import { ArrowLeft, AlertTriangle, Package, Bell, BellOff, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface LowStockItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_code: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  status: 'out_of_stock' | 'low_stock';
}

export default function AlertsPage() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [expiredBatches, setExpiredBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getProducts({ limit: '500' }),
      api.getNotifications({ limit: '50' }),
      api.getProductBatches({ status: 'active', limit: '500' }),
    ]).then(([prodRes, notifRes, batchRes]: any[]) => {
      const products = prodRes.data || [];
      const items: LowStockItem[] = [];
      for (const p of products) {
        if (!p.track_stock || !p.is_active) continue;
        const levels = p.stock_levels || [];
        if (levels.length === 0) {
          // Product with no stock levels at all
          if (p.min_stock > 0) {
            items.push({
              product_id: p.id,
              product_name: p.name,
              product_sku: p.sku,
              warehouse_id: '',
              warehouse_name: 'Sin asignar',
              warehouse_code: '',
              current_stock: 0,
              min_stock: p.min_stock,
              max_stock: p.max_stock || 0,
              status: 'out_of_stock',
            });
          }
          continue;
        }
        for (const sl of levels) {
          const qty = Number(sl.quantity || 0);
          const minStock = Number(p.min_stock || 0);
          if (qty === 0 && minStock > 0) {
            items.push({
              product_id: p.id,
              product_name: p.name,
              product_sku: p.sku,
              warehouse_id: sl.warehouse?.id || '',
              warehouse_name: sl.warehouse?.name || '',
              warehouse_code: sl.warehouse?.code || '',
              current_stock: qty,
              min_stock: minStock,
              max_stock: Number(p.max_stock || 0),
              status: 'out_of_stock',
            });
          } else if (qty > 0 && qty <= minStock) {
            items.push({
              product_id: p.id,
              product_name: p.name,
              product_sku: p.sku,
              warehouse_id: sl.warehouse?.id || '',
              warehouse_name: sl.warehouse?.name || '',
              warehouse_code: sl.warehouse?.code || '',
              current_stock: qty,
              min_stock: minStock,
              max_stock: Number(p.max_stock || 0),
              status: 'low_stock',
            });
          }
        }
      }
      setLowStockItems(items);
      setNotifications((notifRes.data || []).slice(0, 20));

      const batches = batchRes.data || [];
      const now = new Date();
      const expired = batches.filter((b: any) => {
        if (!b.expiry_date) return false;
        return new Date(b.expiry_date) < now;
      });
      setExpiredBatches(expired);

      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = lowStockItems.filter(item => {
    if (filter === 'out_of_stock') return item.status === 'out_of_stock';
    if (filter === 'low_stock') return item.status === 'low_stock';
    return true;
  });

  const outOfStockCount = lowStockItems.filter(i => i.status === 'out_of_stock').length;
  const lowStockCount = lowStockItems.filter(i => i.status === 'low_stock').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Alertas de Stock</h1>
          <p className="text-sm text-slate-500 mt-1">Productos por debajo del stock minimo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Sin Stock</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{outOfStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock Bajo</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Alertas</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{lowStockItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Lotes Vencidos</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{expiredBatches.length}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todas las alertas' },
                { value: 'out_of_stock', label: 'Sin stock' },
                { value: 'low_stock', label: 'Stock bajo' },
              ]}
              className="w-full sm:w-48"
            />
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
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Todo en orden. Sin alertas de stock.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                    <th className="text-center px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock Actual</th>
                    <th className="text-center px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock Minimo</th>
                    <th className="text-center px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => (
                    <tr key={`${item.product_id}-${item.warehouse_id}-${idx}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <Link href={`/dashboard/inventory/${item.product_id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                          {item.product_name}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-xs font-mono text-slate-500">{item.product_sku}</td>
                      <td className="px-6 py-3 text-xs text-slate-700">{item.warehouse_name}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`text-xs font-bold ${item.status === 'out_of_stock' ? 'text-rose-600' : 'text-amber-600'}`}>
                          {item.current_stock}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center text-xs text-slate-500">{item.min_stock}</td>
                      <td className="px-6 py-3 text-center">
                        <Badge variant={item.status === 'out_of_stock' ? 'danger' : 'warning'}>
                          {item.status === 'out_of_stock' ? 'Sin Stock' : 'Bajo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {expiredBatches.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-semibold text-slate-900">Lotes Vencidos ({expiredBatches.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Lote</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredBatches.map((b) => (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-slate-900">{b.product?.name || '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-700">{b.batch_number}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{b.warehouse?.name || '—'}</td>
                      <td className="px-4 py-3 text-center text-xs font-bold text-rose-600">{b.quantity}</td>
                      <td className="px-4 py-3 text-xs text-rose-600 font-medium">
                        {new Date(b.expiry_date).toLocaleDateString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
