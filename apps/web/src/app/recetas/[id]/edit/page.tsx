'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

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
    min_margin_pct: '',
    max_margin_pct: '',
  });
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getFormula(formulaId),
      api.getRecipeProducts({ limit: '500' }),
    ]).then(([formulaData, productsData]) => {
      setForm({
        name: formulaData.name || '',
        description: formulaData.description || '',
        output_product_id: formulaData.output_product_id || '',
        yield_quantity: String(formulaData.yield_quantity || 1),
        yield_unit: formulaData.yield_unit || 'un',
        min_margin_pct: formulaData.min_margin_pct != null ? String(formulaData.min_margin_pct) : '',
        max_margin_pct: formulaData.max_margin_pct != null ? String(formulaData.max_margin_pct) : '',
      });
      setIngredients(
        (formulaData.ingredients || []).map((ing: any) => ({
          product_id: ing.product_id || '',
          quantity: String(ing.quantity || ''),
          unit: ing.unit || 'un',
        }))
      );
      setProducts(productsData.data || []);
    }).catch(() => {
      toast.error('Error al cargar receta');
    }).finally(() => setLoading(false));
  }, [formulaId]);

  const addIngredient = () => {
    setIngredients([...ingredients, { product_id: '', quantity: '', unit: 'un' }]);
  };

  const selectedIngredientIds = new Set(ingredients.map(i => i.product_id).filter(Boolean));
  const outputProducts = products.filter(p => p.sellable === true || p.id === form.output_product_id);
  const ingredientProducts = products.filter(p => p.sellable !== true || selectedIngredientIds.has(p.id));

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error('Nombre requerido'); return; }
    if (ingredients.every(i => !i.product_id)) { toast.error('Al menos un ingrediente requerido'); return; }

    setSaving(true);
    try {
      const api = getApiClient();
      await api.updateFormula(formulaId, {
        name: form.name,
        description: form.description,
        output_product_id: form.output_product_id || undefined,
        yield_quantity: parseFloat(form.yield_quantity) || 1,
        yield_unit: form.yield_unit,
        min_margin_pct: form.min_margin_pct ? parseFloat(form.min_margin_pct) : null,
        max_margin_pct: form.max_margin_pct ? parseFloat(form.max_margin_pct) : null,
        ingredients: ingredients
          .filter(i => i.product_id && i.quantity)
          .map(i => ({ product_id: i.product_id, quantity: parseFloat(i.quantity), unit: i.unit })),
      });
      toast.success('Receta actualizada');
      router.push(`/recetas/${formulaId}`);
    } catch (err) {
      toast.error('Error al actualizar receta');
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
          <p className="text-sm text-slate-500 mt-1">Modificar ingredientes, rendimiento y márgenes</p>
        </div>
        <Link href={`/recetas/${formulaId}`}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ej: Torta de Manjar" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Producto de Salida</label>
              <select value={form.output_product_id} onChange={e => setForm(p => ({ ...p, output_product_id: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Ninguno (solo descontar)</option>
                {outputProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Rendimiento</label>
              <div className="flex gap-2">
                <input type="number" step="0.01" value={form.yield_quantity} onChange={e => setForm(p => ({ ...p, yield_quantity: e.target.value }))}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="1" />
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
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-medium text-slate-700">Descripción</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Descripción de la receta..." />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Margen Mínimo (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={form.min_margin_pct} onChange={e => setForm(p => ({ ...p, min_margin_pct: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ej: 10" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Margen Máximo (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={form.max_margin_pct} onChange={e => setForm(p => ({ ...p, max_margin_pct: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ej: 60" />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Ingredientes</h3>
            <button type="button" onClick={addIngredient}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-1">
              <div className="col-span-5">Producto</div>
              <div className="col-span-3">Cantidad</div>
              <div className="col-span-2">Unidad</div>
              <div className="col-span-2"></div>
            </div>
            {ingredients.map((ing, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <select value={ing.product_id} onChange={e => updateIngredient(i, 'product_id', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Seleccionar...</option>
                    {ingredientProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
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

        {/* Submit */}
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
    </div>
  );
}
