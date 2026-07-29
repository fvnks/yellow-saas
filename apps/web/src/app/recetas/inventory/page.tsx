'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Search, Plus, Settings, Pencil, Trash2, X, FlaskConical } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';

function getStockStatus(stock: number, minStock: number) {
  if (minStock <= 0) return { color: 'text-slate-500 bg-slate-50 border-slate-200', label: 'Sin config', dot: 'bg-slate-400' };
  if (stock <= 0) return { color: 'text-rose-700 bg-rose-50 border-rose-200', label: 'Sin stock', dot: 'bg-rose-500' };
  if (stock <= minStock * 0.5) return { color: 'text-rose-700 bg-rose-50 border-rose-200', label: 'Crítico', dot: 'bg-rose-500' };
  if (stock <= minStock) return { color: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Bajo', dot: 'bg-amber-500' };
  return { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'OK', dot: 'bg-emerald-500' };
}

interface ProductForm {
  name: string;
  sku: string;
  unit_of_measure: string;
  cost_price: string;
  sale_price: string;
  description: string;
}

const emptyForm: ProductForm = { name: '', sku: '', unit_of_measure: 'UN', cost_price: '', sale_price: '', description: '' };

function ProductModal({ open, onClose, onSave, editProduct }: {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProductForm) => Promise<void>;
  editProduct?: any;
}) {
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name || '',
        sku: editProduct.sku || '',
        unit_of_measure: editProduct.unit_of_measure || 'UN',
        cost_price: editProduct.cost_price ? String(editProduct.cost_price) : '',
        sale_price: editProduct.sale_price ? String(editProduct.sale_price) : '',
        description: editProduct.description || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editProduct, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nombre requerido'); return; }
    if (!form.sku.trim()) { toast.error('SKU requerido'); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch { }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{editProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Nombre *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: Harina de trigo" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">SKU *</label>
              <input type="text" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                placeholder="ING-001" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Unidad</label>
              <select value={form.unit_of_measure} onChange={e => setForm(p => ({ ...p, unit_of_measure: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="UN">Unidad</option>
                <option value="KG">Kilogramo</option>
                <option value="G">Gramo</option>
                <option value="L">Litro</option>
                <option value="ML">Mililitro</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Costo Unitario</label>
              <input type="number" step="1" min="0" value={form.cost_price} onChange={e => setForm(p => ({ ...p, cost_price: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Precio Venta</label>
              <input type="number" step="1" min="0" value={form.sale_price} onChange={e => setForm(p => ({ ...p, sale_price: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Descripción</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Descripción..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : editProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RecipeInventoryPage() {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'products'>('ingredients');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const api = getApiClient();
      const res = await api.getRecipeProducts({ limit: '500' });
      setAllProducts(res.data || []);
    } catch {
      toast.error('Error al cargar inventario');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const isOutputProduct = (p: any) => !!p.formula;

  const ingredients = allProducts.filter(p => !isOutputProduct(p));
  const products = allProducts.filter(p => isOutputProduct(p));
  const displayed = activeTab === 'ingredients' ? ingredients : products;

  const filtered = search
    ? displayed.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
    : displayed;

  const totalStock = displayed.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const lowStockCount = displayed.filter(p => {
    const stock = Number(p.stock) || 0;
    const min = Number(p.min_stock) || 0;
    return min > 0 && stock <= min;
  }).length;

  const handleCreate = async (data: ProductForm) => {
    const api = getApiClient();
    await api.createRecipeProduct({
      name: data.name.trim(),
      sku: data.sku.trim(),
      unit_of_measure: data.unit_of_measure,
      cost_price: data.cost_price ? parseFloat(data.cost_price) : 0,
      sale_price: data.sale_price ? parseFloat(data.sale_price) : 0,
      description: data.description || undefined,
    });
    toast.success(activeTab === 'ingredients' ? 'Ingrediente creado' : 'Producto creado');
    loadProducts();
  };

  const handleEdit = async (data: ProductForm) => {
    if (!editProduct) return;
    const api = getApiClient();
    await api.updateRecipeProduct(editProduct.id, {
      name: data.name.trim(),
      sku: data.sku.trim(),
      unit_of_measure: data.unit_of_measure,
      cost_price: data.cost_price ? parseFloat(data.cost_price) : 0,
      sale_price: data.sale_price ? parseFloat(data.sale_price) : 0,
      description: data.description || undefined,
    });
    toast.success('Producto actualizado');
    setEditProduct(null);
    loadProducts();
  };

  const handleDelete = async (product: any) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    setDeleting(product.id);
    try {
      const api = getApiClient();
      await api.deleteRecipeProduct(product.id);
      toast.success('Producto eliminado');
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventario de Recetas</h1>
          <p className="text-sm text-slate-500 mt-1">Control de stock de ingredientes y productos de producción</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/recetas/settings"
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Settings className="w-4 h-4" /> Configurar
          </Link>
          <button onClick={() => { setEditProduct(null); setModalOpen(true); }}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-fit">
        <button onClick={() => setActiveTab('ingredients')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'ingredients' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-500 hover:text-slate-700'
          }`}>
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Ingredientes
            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{ingredients.length}</span>
          </span>
        </button>
        <button onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'products' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-500 hover:text-slate-700'
          }`}>
          <span className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            Producción
            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{products.length}</span>
          </span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
            {activeTab === 'ingredients' ? 'Ingredientes' : 'Productos'}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{displayed.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalStock.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[9px] font-semibold text-rose-500 uppercase tracking-wider">Stock Bajo</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{lowStockCount}</p>
        </div>
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
                {activeTab === 'products' && (
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                )}
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Mínimo</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="border-b border-slate-100">
                    <td colSpan={8} className="px-4 py-3"><div className="h-5 bg-slate-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      {search ? 'No se encontraron resultados' : activeTab === 'ingredients' ? 'No hay ingredientes registrados' : 'No hay productos de producción'}
                    </p>
                    {!search && (
                      <button onClick={() => { setEditProduct(null); setModalOpen(true); }}
                        className="text-sm text-indigo-600 hover:underline mt-1 inline-block">
                        Crear primer {activeTab === 'ingredients' ? 'ingrediente' : 'producto'}
                      </button>
                    )}
                  </td>
                </tr>
              ) : filtered.map(p => {
                const stock = Number(p.stock) || 0;
                const minStock = Number(p.min_stock) || 0;
                const status = getStockStatus(stock, minStock);
                return (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className={`w-4 h-4 ${activeTab === 'ingredients' ? 'text-amber-500' : 'text-indigo-500'}`} />
                        <div>
                          <span className="text-xs font-medium text-slate-900">{p.name}</span>
                          {p.formula && (
                            <p className="text-[9px] text-slate-400">{p.formula.name} · {Number(p.formula.yield_quantity)} {p.formula.yield_unit}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-mono">{p.sku}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{p.unit_of_measure}</td>
                    {activeTab === 'products' && (
                      <td className="px-4 py-3 text-right text-xs font-semibold text-slate-900">
                        ${(Number(p.sale_price) || 0).toLocaleString('es-CL')}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-xs font-semibold text-slate-900">{stock.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">{minStock > 0 ? minStock.toLocaleString('es-CL') : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditProduct(p); setModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p)} disabled={deleting === p.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditProduct(null); }}
        onSave={editProduct ? handleEdit : handleCreate}
        editProduct={editProduct}
      />
    </div>
  );
}
