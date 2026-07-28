'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import QuickCreateProduct from '@/components/recetas/QuickCreateProduct';

export default function RecipeInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const loadProducts = async () => {
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '500' };
      if (search) params.search = search;
      const res = await api.getRecipeProducts(params);
      setProducts(res.data || []);
    } catch {
      toast.error('Error al cargar ingredientes');
    }
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, [search]);

  const handleCreated = () => {
    loadProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventario de Recetas</h1>
          <p className="text-sm text-slate-500 mt-1">Ingredientes y productos del módulo de recetas</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Ingrediente
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Buscar por nombre o SKU..." />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Unidad</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Precio Venta</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="border-b border-slate-100">
                    <td colSpan={6} className="px-4 py-3"><div className="h-5 bg-slate-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No hay ingredientes registrados</p>
                    <button onClick={() => setShowCreate(true)}
                      className="text-sm text-indigo-600 hover:underline mt-1 inline-block">
                      Crear primer ingrediente
                    </button>
                  </td>
                </tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-medium text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-mono">{p.sku}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{p.unit_of_measure}</td>
                  <td className="px-4 py-3 text-right text-xs text-slate-600">${(p.cost_price || 0).toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-right text-xs text-slate-600">${(p.sale_price || 0).toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                      p.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {p.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <QuickCreateProduct
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
