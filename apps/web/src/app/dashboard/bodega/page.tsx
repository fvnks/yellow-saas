'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
  import { 
  Package, Warehouse, ClipboardCheck, Truck, AlertTriangle, Upload, 
  Plus, Search, Eye, Play, CheckCircle, ArrowRight, Download, MapPin, Users, Activity, Grid, Edit, Trash2, Settings
} from 'lucide-react';
import { getApiClient, getCompanyIdFromToken } from '../../../lib/api-client';
import BarcodeScanner from '../../../components/barcode/barcode-scanner';
import Pagination from '../../../components/ui/pagination';

type Tab = 'products' | 'warehouses' | 'counts' | 'transfers' | 'alerts' | 'import';

interface Product {
  id: string; name: string; sku: string; stock: number; minStock: number;
  price: number; cost: number; status: string; warehouse: string;
  cost_center?: { id: string; name: string; code: string } | null;
  category?: string; tax?: { id: string; name: string; rate: number; code: string } | null;
}
interface WarehouseItem {
  id: string; name: string; code: string; address?: string; city?: string;
  region?: string; phone?: string; email?: string; is_default?: boolean;
  is_active?: boolean; total_products?: number; total_stock?: number;
}
interface CountItem {
  id: string; count_number: string; status: string; count_type: string;
  warehouse: { id: string; name: string; code: string };
  items_count: number; counted_items: number; created_at: string;
}
interface TransferItem {
  id: string; transfer_number: string; status: string;
  source_warehouse: { name: string }; destination_warehouse: { name: string };
  items_count: number; total_quantity: number; created_at: string;
}
interface AlertItem {
  product_id: string; product_name: string; product_sku: string;
  warehouse_id: string; warehouse_name: string;
  current_stock: number; min_stock: number; status: string;
}

const countStatus: Record<string, { bg: string; text: string; border: string; label: string }> = {
  draft: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Borrador' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'En Progreso' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Completado' },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Cancelado' },
};
const transferStatus: Record<string, { bg: string; text: string; border: string; label: string }> = {
  draft: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Borrador' },
  in_transit: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'En Transito' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Entregada' },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Cancelada' },
};

export default function BodegaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [counts, setCounts] = useState<CountItem[]>([]);
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const limit = 20;

  useEffect(() => { loadAll(); }, [page, search]);

  const loadAll = async () => {
    setLoading(true);
    try {
      let api;
      try {
        api = getApiClient();
      } catch {
        setLoading(false);
        return;
      }
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.search = search;

        const companyId = getCompanyIdFromToken();
        const [prodRes, whRes, cntRes, trfRes, altRes] = await Promise.all([
          api.getProducts(params),
          api.getWarehouses({ limit: '100' }),
          api.getInventoryCounts({ limit: '100' }).catch(() => ({ data: [] })),
          api.getStockTransfers({ limit: '100' }).catch(() => ({ data: [] })),
          companyId ? fetch(`/api/companies/${companyId}/stock-levels?limit=200`)
            .then(r => r.json())
            .then(d => {
              const levels = d.data || [];
              return levels.filter((l: any) => {
                const qty = l.quantity || 0;
                const product = l.product || {};
                return product.track_stock && product.is_active && product.min_stock > 0 && qty <= product.min_stock;
              }).map((l: any) => ({
                product_id: l.product_id,
                product_name: l.product?.name || '',
                product_sku: l.product?.sku || '',
                warehouse_id: l.warehouse_id,
                warehouse_name: l.warehouse?.name || '',
                current_stock: l.quantity || 0,
                min_stock: l.product?.min_stock || 0,
                status: l.quantity === 0 ? 'out_of_stock' : 'low_stock',
              }));
            })
            .catch(() => []) : Promise.resolve([]),
      ]);
      setProducts((prodRes.data || []).map((p: any) => ({
        id: p.id, name: p.name || '', sku: p.sku || '', stock: p.stock || 0,
        minStock: p.min_stock || 10, price: p.sale_price || p.price || 0, cost: p.cost_price || 0,
        status: p.is_active ? 'active' : 'inactive', warehouse: p.warehouse || '', cost_center: p.cost_center || null,
        category: p.category?.name || '', tax: p.tax || null,
      })));
      setPagination({ total: prodRes.pagination?.total || 0, totalPages: prodRes.pagination?.totalPages || 1 });
      setWarehouses(whRes.data || []);
      setCounts(cntRes.data || []);
      setTransfers(trfRes.data || []);
      setAlerts(altRes);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );
  const filteredWarehouses = warehouses.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) || w.code.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCounts = counts.filter(c =>
    c.count_number.toLowerCase().includes(search.toLowerCase()) || c.warehouse?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTransfers = transfers.filter(t =>
    t.transfer_number.toLowerCase().includes(search.toLowerCase()) ||
    t.source_warehouse?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.destination_warehouse?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { id: Tab; label: string; icon: any; count: number }[] = [
    { id: 'products', label: 'Productos', icon: Package, count: products.length },
    { id: 'warehouses', label: 'Bodegas', icon: Warehouse, count: warehouses.length },
    { id: 'counts', label: 'Conteos', icon: ClipboardCheck, count: counts.length },
    { id: 'transfers', label: 'Transferencias', icon: Truck, count: transfers.length },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle, count: alerts.length },
    { id: 'import', label: 'Importar', icon: Upload, count: 0 },
  ];

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Sin stock', variant: 'danger' as const };
    if (stock <= minStock) return { label: 'Bajo', variant: 'warning' as const };
    return { label: 'Normal', variant: 'success' as const };
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Eliminar este producto?')) return;
    try {
      const api = getApiClient();
      await api.deleteProduct(id);
      loadAll();
    } catch (err) { console.error(err); }
  };

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm('Eliminar esta bodega?')) return;
    try {
      const api = getApiClient();
      await api.deleteWarehouse(id);
      loadAll();
    } catch (err) { console.error(err); }
  };

  const handleExportProducts = () => {
    const headers = ['Nombre', 'SKU', 'Categoria', 'Stock', 'Costo', 'Precio', 'Estado'];
    const rows = filteredProducts.map(p => [p.name, p.sku, p.category || '', p.stock, p.cost, p.price, p.status]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inventario.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventario y Bodega</h1>
          <p className="text-sm text-slate-500 mt-1">Gestion completa de inventario</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/inventory/stock-report" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
            <Package className="w-4 h-4" /> Valorización
          </Link>
          <Link href="/dashboard/inventory/config" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
            <Settings className="w-4 h-4" /> Configurar
          </Link>
          {activeTab === 'products' && (
            <>
              <button onClick={() => setShowScanner(true)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
                <Search className="w-4 h-4" /> Escanear
              </button>
              <Link href="/dashboard/inventory/new" className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> Nuevo Producto
              </Link>
            </>
          )}
          {activeTab === 'warehouses' && (
            <Link href="/dashboard/warehouses/new" className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Nueva Bodega
            </Link>
          )}
          {activeTab === 'counts' && (
            <Link href="/dashboard/inventory/counts/new" className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Nuevo Conteo
            </Link>
          )}
          {activeTab === 'transfers' && (
            <Link href="/dashboard/transfers/new" className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Nueva Transferencia
            </Link>
          )}
          {activeTab === 'alerts' && (
            <button onClick={loadAll} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" /> Actualizar
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Productos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-indigo-600" /></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodegas</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{warehouses.length}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><Warehouse className="w-5 h-5 text-emerald-600" /></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Conteos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{counts.length}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><ClipboardCheck className="w-5 h-5 text-amber-600" /></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Alertas</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{alerts.length}</p>
            </div>
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-rose-600" /></div>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); setStatusFilter('all'); }}
                className={`px-5 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search bar (except import) */}
        {activeTab !== 'import' && (
          <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === 'products' ? 'Buscar por nombre, SKU...' :
                  activeTab === 'warehouses' ? 'Buscar por nombre, codigo...' :
                  activeTab === 'counts' ? 'Buscar por numero, bodega...' :
                  activeTab === 'transfers' ? 'Buscar por numero, bodega...' :
                  'Buscar...'
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(p => {
                        const ss = getStockStatus(p.stock, p.minStock);
                        return (
                          <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-xs font-medium text-slate-900">{p.name}</td>
                            <td className="px-4 py-3 text-[9px] font-mono text-slate-500">{p.sku}</td>
                            <td className="px-4 py-3 text-xs text-slate-600">{p.category || '-'}</td>
                            <td className="px-4 py-3 text-center text-xs font-bold" style={{ color: ss.variant === 'danger' ? '#e11d48' : ss.variant === 'warning' ? '#f59e0b' : '#059669' }}>{p.stock}</td>
                            <td className="px-4 py-3 text-right text-xs text-slate-700">{formatCurrency(p.cost)}</td>
                            <td className="px-4 py-3 text-right text-xs text-slate-700">{formatCurrency(p.price)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                                ss.variant === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                ss.variant === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>{ss.label}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1">
                                <Link href={`/dashboard/inventory/${p.id}`} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Eye className="w-4 h-4" /></Link>
                                <Link href={`/dashboard/inventory/${p.id}/edit`} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Edit className="w-4 h-4" /></Link>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredProducts.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No se encontraron productos</div>}
                </div>
              )}

              {/* Pagination for products */}
              {activeTab === 'products' && (
                <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} limit={limit} onPageChange={setPage} />
              )}

              {/* WAREHOUSES TAB */}
              {activeTab === 'warehouses' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Codigo</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Ciudad</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Productos</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWarehouses.map(w => (
                        <tr key={w.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs font-medium text-slate-900">{w.name}</td>
                          <td className="px-4 py-3 text-[9px] font-mono text-slate-500">{w.code}</td>
                          <td className="px-4 py-3 text-xs text-slate-700">{w.city || '-'}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-700">{w.total_products || 0}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                              w.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>{w.is_active ? 'Activa' : 'Inactiva'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Link href={`/dashboard/bodega/${w.id}/layout`} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Grid className="w-4 h-4" /></Link>
                              <Link href={`/dashboard/warehouses/${w.id}/edit`} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Edit className="w-4 h-4" /></Link>
                              <button onClick={() => handleDeleteWarehouse(w.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredWarehouses.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No se encontraron bodegas</div>}
                </div>
              )}

              {/* COUNTS TAB */}
              {activeTab === 'counts' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Numero</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Progreso</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCounts.map(c => {
                        const st = countStatus[c.status] || countStatus.draft;
                        const pct = c.items_count ? Math.round((c.counted_items / c.items_count) * 100) : 0;
                        return (
                          <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-xs font-mono font-semibold text-slate-900">{c.count_number}</td>
                            <td className="px-4 py-3 text-xs text-slate-700">{c.warehouse?.name}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-100 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} /></div>
                                <span className="text-[9px] text-slate-500">{c.counted_items}/{c.items_count}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.bg} ${st.text} border ${st.border}`}>{st.label}</span></td>
                            <td className="px-4 py-3 text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString('es-CL')}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end">
                                <Link href={`/dashboard/inventory/counts/${c.id}`} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Eye className="w-4 h-4" /></Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredCounts.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay conteos de inventario</div>}
                </div>
              )}

              {/* TRANSFERS TAB */}
              {activeTab === 'transfers' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Numero</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Origen</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider"><ArrowRight className="w-3 h-3 inline" /></th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Destino</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransfers.map(t => {
                        const st = transferStatus[t.status] || transferStatus.draft;
                        return (
                          <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-xs font-mono font-semibold text-slate-900">{t.transfer_number}</td>
                            <td className="px-4 py-3 text-xs text-slate-700">{t.source_warehouse?.name}</td>
                            <td className="px-4 py-3 text-center"><ArrowRight className="w-4 h-4 text-slate-400 mx-auto" /></td>
                            <td className="px-4 py-3 text-xs text-slate-700">{t.destination_warehouse?.name}</td>
                            <td className="px-4 py-3 text-center"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.bg} ${st.text} border ${st.border}`}>{st.label}</span></td>
                            <td className="px-4 py-3 text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString('es-CL')}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end">
                                <Link href={`/dashboard/transfers/${t.id}`} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Eye className="w-4 h-4" /></Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredTransfers.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay transferencias</div>}
                </div>
              )}

              {/* ALERTS TAB */}
              {activeTab === 'alerts' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Minimo</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((a, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs font-medium text-slate-900">{a.product_name}</td>
                          <td className="px-4 py-3 text-[9px] font-mono text-slate-500">{a.product_sku}</td>
                          <td className="px-4 py-3 text-xs text-slate-700">{a.warehouse_name}</td>
                          <td className="px-4 py-3 text-center text-xs font-bold text-rose-600">{a.current_stock}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-500">{a.min_stock}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                              a.status === 'out_of_stock' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>{a.status === 'out_of_stock' ? 'Sin Stock' : 'Bajo'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {alerts.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay alertas de stock bajo</div>}
                </div>
              )}

              {/* IMPORT TAB */}
              {activeTab === 'import' && (
                <div className="p-6">
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <p className="text-sm font-medium text-blue-800">Importa productos desde un archivo CSV</p>
                      <p className="text-xs text-blue-600 mt-1">Columnas requeridas: name, sku</p>
                    </div>
                    <Link href="/dashboard/inventory/import" className="block bg-slate-50 border border-slate-200 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
                      <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-700">Ir a importar productos</p>
                      <p className="text-xs text-slate-500 mt-1">Carga masiva con CSV</p>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showScanner && <BarcodeScanner onScan={(code) => { setSearch(code); setShowScanner(false); }} onClose={() => setShowScanner(false)} />}
    </div>
  );
}
