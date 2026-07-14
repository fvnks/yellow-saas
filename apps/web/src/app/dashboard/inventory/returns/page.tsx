'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Package, CheckCircle, Eye, X, RotateCcw } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface CustomerReturn { id: string; return_number: string; status: string; reason: string | null; total_amount: number | null; created_at: string; customer: { id: string; name: string } | null; warehouse: { id: string; name: string }; items?: ReturnItem[]; }

interface ReturnItem { id: string; quantity: number; unit_price: number; condition: string; restock: boolean; product: { id: string; name: string; sku: string }; }

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  completed: { label: 'Completada', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  cancelled: { label: 'Cancelada', className: 'bg-rose-50 text-rose-700 border border-rose-200' },
};

interface ReturnItemForm { product_id: string; quantity: string; unit_price: string; condition: string; restock: boolean; notes: string; }

export default function ReturnsPage() {
  const [returns, setReturns] = useState<CustomerReturn[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detailReturn, setDetailReturn] = useState<CustomerReturn | null>(null);
  const [search, setSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [form, setForm] = useState({ warehouse_id: '', reason: '', items: [] as ReturnItemForm[] });

  useEffect(() => { loadData(); }, [search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '200' };
      if (search) params.search = search;
      const [rRes, pRes, wRes] = await Promise.all([
        api.getCustomerReturns(params),
        api.getProducts({ limit: '500' }),
        api.getWarehouses({ limit: '100' }),
      ]);
      setReturns(rRes.data || []);
      setProducts(pRes.data || []);
      setWarehouses(wRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filteredProducts = products.filter((p: any) =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) || p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: '1', unit_price: '0', condition: 'good', restock: true, notes: '' }] });
  };

  const updateItem = (idx: number, data: Partial<ReturnItemForm>) => {
    const items = [...form.items]; items[idx] = { ...items[idx], ...data }; setForm({ ...form, items });
  };

  const removeItem = (idx: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const saveReturn = async () => {
    if (!form.warehouse_id || form.items.length === 0) return;
    const api = getApiClient();
    await api.createCustomerReturn({
      warehouse_id: form.warehouse_id,
      reason: form.reason || undefined,
      items: form.items.map(i => ({
        product_id: i.product_id,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        condition: i.condition,
        restock: i.restock,
        notes: i.notes || undefined,
      })),
    });
    setShowForm(false); setForm({ warehouse_id: '', reason: '', items: [] }); setProductSearch(''); loadData();
  };

  const viewDetail = async (ret: CustomerReturn) => {
    try {
      const detail = await getApiClient().getCustomerReturn(ret.id);
      setDetailReturn(detail);
    } catch (e) { console.error(e); }
  };

  const completeReturn = async (id: string) => {
    if (!confirm('Completar esta devolucion?')) return;
    await getApiClient().completeCustomerReturn(id);
    setDetailReturn(null); loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="/dashboard/inventory" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </a>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Devoluciones</h1>
            <p className="text-sm text-slate-500 mt-1">Gestion de devoluciones de clientes</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nueva Devolucion
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Nueva Devolucion</h3>
            <button onClick={() => { setShowForm(false); setForm({ warehouse_id: '', reason: '', items: [] }); setProductSearch(''); }}
              className="text-slate-400 hover:text-slate-600 text-sm">Cancelar</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Bodega</label>
              <select value={form.warehouse_id} onChange={e => setForm({ ...form, warehouse_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Seleccionar bodega...</option>
                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Motivo</label>
              <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Motivo de la devolucion..." rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-700">Items</h4>
              <button onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" /> Agregar item
              </button>
            </div>
            {form.items.length === 0 && <p className="text-xs text-slate-500 py-2">No hay items agregados</p>}
            {form.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2 mb-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="sm:col-span-2 relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <input type="text" placeholder="Producto..." value={item.product_id ? products.find((p: any) => p.id === item.product_id)?.name || '' : productSearch}
                    onChange={e => { setProductSearch(e.target.value); if (item.product_id) updateItem(idx, { product_id: '' }); }}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  {productSearch && !item.product_id && (
                    <div className="absolute z-10 w-full border border-slate-200 rounded-lg max-h-32 overflow-y-auto bg-white mt-1 shadow-lg">
                      {filteredProducts.slice(0, 5).map((p: any) => (
                        <button key={p.id} onClick={() => { updateItem(idx, { product_id: p.id }); setProductSearch(''); }}
                          className="w-full text-left px-2 py-1.5 text-xs hover:bg-slate-50 border-b border-slate-100 last:border-0">{p.name}</button>
                      ))}
                    </div>
                  )}
                </div>
                <input type="number" value={item.quantity} onChange={e => updateItem(idx, { quantity: e.target.value })} placeholder="Cant."
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="number" value={item.unit_price} onChange={e => updateItem(idx, { unit_price: e.target.value })} placeholder="Precio"
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <select value={item.condition} onChange={e => updateItem(idx, { condition: e.target.value })}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="good">Buen estado</option>
                  <option value="damaged">Danado</option>
                  <option value="defective">Defectuoso</option>
                </select>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-[9px] text-slate-600">
                    <input type="checkbox" checked={item.restock} onChange={e => updateItem(idx, { restock: e.target.checked })} className="rounded border-slate-300" />
                    Reposicion
                  </label>
                  <button onClick={() => removeItem(idx)} className="text-slate-400 hover:text-rose-600 ml-auto"><X className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowForm(false); setForm({ warehouse_id: '', reason: '', items: [] }); setProductSearch(''); }}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
            <button onClick={saveReturn} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Guardar</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar por numero, cliente..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
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
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Numero</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {returns.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-slate-900">{r.return_number}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{r.customer?.name || '-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{r.warehouse?.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${STATUS_MAP[r.status]?.className || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {STATUS_MAP[r.status]?.label || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString('es-CL')}</td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-slate-900">{r.total_amount ? `$${Number(r.total_amount).toLocaleString('es-CL')}` : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => viewDetail(r)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Ver detalle">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {r.status === 'pending' && (
                          <button onClick={() => completeReturn(r.id)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Completar">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {returns.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay devoluciones registradas</div>}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDetailReturn(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Devolucion {detailReturn.return_number}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{detailReturn.customer?.name || 'Sin cliente'} &middot; {new Date(detailReturn.created_at).toLocaleDateString('es-CL')}</p>
              </div>
              <button onClick={() => setDetailReturn(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${STATUS_MAP[detailReturn.status]?.className || ''}`}>
                  {STATUS_MAP[detailReturn.status]?.label || detailReturn.status}
                </span>
                <span className="text-xs text-slate-500">Bodega: {detailReturn.warehouse?.name}</span>
              </div>
              {detailReturn.reason && <p className="text-sm text-slate-600 mb-4">Motivo: {detailReturn.reason}</p>}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                    <th className="text-center px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                    <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Precio Unit.</th>
                    <th className="text-center px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Condicion</th>
                    <th className="text-center px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Reposicion</th>
                  </tr>
                </thead>
                <tbody>
                  {(detailReturn.items || []).map((item: ReturnItem) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="px-3 py-2">
                        <p className="text-xs font-medium text-slate-900">{item.product?.name}</p>
                        <p className="text-[9px] text-slate-500">{item.product?.sku}</p>
                      </td>
                      <td className="px-3 py-2 text-center text-xs text-slate-700">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-xs text-slate-700">${Number(item.unit_price).toLocaleString('es-CL')}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-[9px] text-slate-600 capitalize">{item.condition === 'good' ? 'Buen estado' : item.condition === 'damaged' ? 'Danado' : 'Defectuoso'}</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.restock ? <span className="text-emerald-600 text-[9px] font-semibold">Si</span> : <span className="text-slate-400 text-[9px]">No</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setDetailReturn(null)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cerrar</button>
              {detailReturn.status === 'pending' && (
                <button onClick={() => completeReturn(detailReturn.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                  <CheckCircle className="w-4 h-4" /> Completar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
