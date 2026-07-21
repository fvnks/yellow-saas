'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Hash, Package } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface ProductSerial { id: string; serial_number: string; status: string; notes: string | null; created_at: string; product: { id: string; name: string; sku: string }; warehouse: { id: string; name: string } | null; }

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  in_stock: { label: 'En Stock', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  sold: { label: 'Vendido', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  damaged: { label: 'Danado', className: 'bg-rose-50 text-rose-700 border border-rose-200' },
  returned: { label: 'Devuelto', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
};

export default function SerialsPage() {
  const [serials, setSerials] = useState<ProductSerial[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [form, setForm] = useState({ product_id: '', warehouse_id: '', serial_number: '', notes: '' });

  useEffect(() => { loadData(); }, [search, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '200' };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const [sRes, pRes, wRes] = await Promise.all([
        api.getProductSerials(params),
        api.getProducts({ limit: '200' }),
        api.getWarehouses({ limit: '100' }),
      ]);
      setSerials(sRes.data || []);
      setProducts(pRes.data || []);
      setWarehouses(wRes.data || []);
    } catch (e) { toast.error('Error al cargar serializaciones'); }
    setLoading(false);
  };

  const filteredProducts = products.filter((p: any) =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) || p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const saveSerial = async () => {
    if (!form.product_id || !form.warehouse_id || !form.serial_number) return;
    await getApiClient().createProductSerial(form);
    setShowForm(false); setForm({ product_id: '', warehouse_id: '', serial_number: '', notes: '' }); setProductSearch(''); loadData();
  };

  const getProductName = (id: string) => products.find((p: any) => p.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/inventory" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Seriales de Productos</h1>
            <p className="text-sm text-slate-500 mt-1">Gestion de numeros de serie por producto</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Serial
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Nuevo Serial</h3>
            <button onClick={() => { setShowForm(false); setForm({ product_id: '', warehouse_id: '', serial_number: '', notes: '' }); setProductSearch(''); }}
              className="text-slate-400 hover:text-slate-600 text-sm">Cancelar</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Producto</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Buscar producto..." value={productSearch} onChange={e => setProductSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              {productSearch && (
                <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto bg-white">
                  {filteredProducts.slice(0, 10).map((p: any) => (
                    <button key={p.id} onClick={() => { setForm({ ...form, product_id: p.id }); setProductSearch(p.name); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <span className="font-medium text-slate-900">{p.name}</span>
                      <span className="text-slate-500 ml-2">{p.sku}</span>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && <div className="px-3 py-2 text-sm text-slate-500">Sin resultados</div>}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Bodega</label>
              <select value={form.warehouse_id} onChange={e => setForm({ ...form, warehouse_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Seleccionar bodega...</option>
                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Numero de Serie</label>
              <input type="text" value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} placeholder="SN-00001"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Notas</label>
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notas opcionales..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => { setShowForm(false); setForm({ product_id: '', warehouse_id: '', serial_number: '', notes: '' }); setProductSearch(''); }}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
            <button onClick={saveSerial} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Guardar</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar por serial, producto..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'in_stock', 'sold', 'damaged', 'returned'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {s === 'all' ? 'Todos' : STATUS_MAP[s]?.label || s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Serial</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {serials.map(s => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-slate-900">{s.product?.name}</p>
                      <p className="text-[9px] text-slate-500">{s.product?.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-slate-900">{s.serial_number}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{s.warehouse?.name || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${STATUS_MAP[s.status]?.className || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {STATUS_MAP[s.status]?.label || s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(s.created_at).toLocaleDateString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {serials.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay seriales registrados</div>}
          </div>
        )}
      </div>
    </div>
  );
}
