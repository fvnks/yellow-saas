'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import QuickCreateProduct from '@/components/recetas/QuickCreateProduct';

interface Ingredient {
  product_id: string;
  quantity: string;
  unit: string;
}

export default function EditRecetaPage() {
  const params = useParams();
  const router = useRouter();
  const formulaId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    output_product_id: '',
    yield_quantity: '1',
    yield_unit: 'un',
    is_active: true,
  });
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [createProductForIndex, setCreateProductForIndex] = useState<number | null>(null);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getFormula(formulaId),
      api.getRecipeProducts({ limit: '500' }),
    ]).then(([formulaData, productsRes]) => {
      setForm({
        name: formulaData.name || '',
        description: formulaData.description || '',
        output_product_id: formulaData.output_product_id || '',
        yield_quantity: String(formulaData.yield_quantity || 1),
        yield_unit: formulaData.yield_unit || 'un',
        is_active: formulaData.is_active,
      });
      setIngredients(
        (formulaData.ingredients || []).map((i: any) => ({
          product_id: i.product_id,
          quantity: String(i.quantity),
          unit: i.unit || 'un',
        }))
      );
      setProducts(productsRes.data || []);
      setLoading(false);
    }).catch(() => {
      toast.error('Error al cargar receta');
      setLoading(false);
    });
  }, [formulaId]);

  const addIngredient = () => {
    setIngredients([...ingredients, { product_id: '', quantity: '', unit: 'un' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleProductCreated = (product: { id: string; name: string; sku: string }) => {
    setProducts(prev => [...prev, product]);
    if (createProductForIndex !== null) {
      updateIngredient(createProductForIndex, 'product_id', product.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error('Nombre requerido'); return; }

    setSaving(true);
    try {
      const api = getApiClient();
      await api.updateFormula(formulaId, {
        name: form.name,
        description: form.description,
        output_product_id: form.output_product_id || undefined,
        yield_quantity: parseFloat(form.yield_quantity) || 1,
        yield_unit: form.yield_unit,
        is_active: form.is_active,
        ingredients: ingredients
          .filter(i => i.product_id && i.quantity)
          .map(i => ({ product_id: i.product_id, quantity: parseFloat(i.quantity), unit: i.unit })),
      });
      toast.success('Receta actualizada');
      router.push(`/recetas/${formulaId}`);
    } catch {
      toast.error('Error al actualizar');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Editar Receta</h1>
          <p className="text-sm text-slate-500 mt-1">Modificar ingredientes y configuración</p>
        </div>
        <Link href={`/recetas/${formulaId}`}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Producto de Salida</label>
              <select value={form.output_product_id} onChange={e => setForm(p => ({ ...p, output_product_id: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Ninguno</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Rendimiento</label>
              <div className="flex gap-2">
                <input type="number" step="0.01" value={form.yield_quantity} onChange={e => setForm(p => ({ ...p, yield_quantity: e.target.value }))}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                <select value={form.yield_unit} onChange={e => setForm(p => ({ ...p, yield_unit: e.target.value }))}
                  className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="un">un</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="l">l</option>
                  <option value="ml">ml</option>
                  <option value="porciones">porciones</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Estado</label>
              <select value={form.is_active ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, is_active: e.target.value === 'true' }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-medium text-slate-700">Descripción</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Ingredientes</h3>
            <button type="button" onClick={addIngredient}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>
          </div>
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5 flex gap-1">
                  <select value={ing.product_id} onChange={e => updateIngredient(i, 'product_id', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Seleccionar...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <button type="button" onClick={() => { setCreateProductForIndex(i); setShowCreateProduct(true); }}
                    className="px-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-medium transition-colors shrink-0"
                    title="Crear nuevo ingrediente">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="col-span-3">
                  <input type="number" step="0.001" value={ing.quantity} onChange={e => updateIngredient(i, 'quantity', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.000" />
                </div>
                <div className="col-span-2">
                  <select value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="un">un</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
                <div className="col-span-2 flex justify-center">
                  <button type="button" onClick={() => removeIngredient(i)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={ingredients.length <= 1}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href={`/recetas/${formulaId}`}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>

      <QuickCreateProduct
        open={showCreateProduct}
        onClose={() => { setShowCreateProduct(false); setCreateProductForIndex(null); }}
        onCreated={handleProductCreated}
      />
    </div>
  );
}
