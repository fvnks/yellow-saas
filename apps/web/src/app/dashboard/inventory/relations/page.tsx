'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Link2 } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface ProductRelation { id: string; relation_type: string; product: { id: string; name: string; sku: string }; related_product: { id: string; name: string; sku: string } | null; }

const TYPE_MAP: Record<string, { label: string; className: string }> = {
  cross_sell: { label: 'Cross-sell', className: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  up_sell: { label: 'Up-sell', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  substitute: { label: 'Sustituto', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  component: { label: 'Componente', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
};

export default function RelationsPage() {
  const [relations, setRelations] = useState<ProductRelation[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [sourceSearch, setSourceSearch] = useState('');
  const [relatedSearch, setRelatedSearch] = useState('');
  const [form, setForm] = useState({ product_id: '', related_product_id: '', relation_type: 'cross_sell' });

  useEffect(() => { loadData(); }, [search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '200' };
      if (search) params.search = search;
      const [rRes, pRes] = await Promise.all([
        api.getProductRelations(params),
        api.getProducts({ limit: '500' }),
      ]);
      setRelations(rRes.data || []);
      setProducts(pRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filteredSource = products.filter((p: any) =>
    p.name?.toLowerCase().includes(sourceSearch.toLowerCase()) || p.sku?.toLowerCase().includes(sourceSearch.toLowerCase())
  );
  const filteredRelated = products.filter((p: any) =>
    p.name?.toLowerCase().includes(relatedSearch.toLowerCase()) || p.sku?.toLowerCase().includes(relatedSearch.toLowerCase())
  );

  const saveRelation = async () => {
    if (!form.product_id || !form.related_product_id || form.product_id === form.related_product_id) return;
    await getApiClient().createProductRelation(form);
    setShowForm(false); setForm({ product_id: '', related_product_id: '', relation_type: 'cross_sell' }); setSourceSearch(''); setRelatedSearch(''); loadData();
  };

  const deleteRelation = async (id: string) => {
    if (!confirm('Eliminar esta relacion?')) return;
    await getApiClient().deleteProductRelation(id); loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/inventory" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Relaciones de Productos</h1>
            <p className="text-sm text-slate-500 mt-1">Conecta productos relacionados entre si</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nueva Relacion
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Nueva Relacion</h3>
            <button onClick={() => { setShowForm(false); setForm({ product_id: '', related_product_id: '', relation_type: 'cross_sell' }); setSourceSearch(''); setRelatedSearch(''); }}
              className="text-slate-400 hover:text-slate-600 text-sm">Cancelar</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Producto Origen</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Buscar producto..." value={sourceSearch} onChange={e => setSourceSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              {sourceSearch && (
                <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-slate-900 dark:border-slate-800">
                  {filteredSource.slice(0, 10).map((p: any) => (
                    <button key={p.id} onClick={() => { setForm({ ...form, product_id: p.id }); setSourceSearch(p.name); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <span className="font-medium text-slate-900">{p.name}</span>
                      <span className="text-slate-500 ml-2">{p.sku}</span>
                    </button>
                  ))}
                  {filteredSource.length === 0 && <div className="px-3 py-2 text-sm text-slate-500">Sin resultados</div>}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Producto Relacionado</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Buscar producto..." value={relatedSearch} onChange={e => setRelatedSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              {relatedSearch && (
                <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-slate-900 dark:border-slate-800">
                  {filteredRelated.slice(0, 10).map((p: any) => (
                    <button key={p.id} onClick={() => { setForm({ ...form, related_product_id: p.id }); setRelatedSearch(p.name); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <span className="font-medium text-slate-900">{p.name}</span>
                      <span className="text-slate-500 ml-2">{p.sku}</span>
                    </button>
                  ))}
                  {filteredRelated.length === 0 && <div className="px-3 py-2 text-sm text-slate-500">Sin resultados</div>}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Tipo</label>
              <select value={form.relation_type} onChange={e => setForm({ ...form, relation_type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => { setShowForm(false); setForm({ product_id: '', related_product_id: '', relation_type: 'cross_sell' }); setSourceSearch(''); setRelatedSearch(''); }}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
            <button onClick={saveRelation} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Guardar</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar relaciones..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        {loading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto Origen</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider"></th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto Relacionado</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {relations.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-slate-900">{r.product?.name}</p>
                      <p className="text-[9px] text-slate-500">{r.product?.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link2 className="w-4 h-4 text-slate-400 mx-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-slate-900">{r.related_product?.name}</p>
                      <p className="text-[9px] text-slate-500">{r.related_product?.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${TYPE_MAP[r.relation_type]?.className || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {TYPE_MAP[r.relation_type]?.label || r.relation_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button onClick={() => deleteRelation(r.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {relations.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay relaciones registradas</div>}
          </div>
        )}
      </div>
    </div>
  );
}
