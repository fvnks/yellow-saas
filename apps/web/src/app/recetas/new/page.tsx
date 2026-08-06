'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import QuickCreateProduct from '@/components/recetas/QuickCreateProduct';
import { useRecetasRefresh } from '@/components/recetas/RefreshContext';

interface Ingredient {
  product_id: string;
  quantity: string;
  unit: string;
}

export default function NewRecetaPage() {
  const router = useRouter();
  const { refreshKey } = useRecetasRefresh();
  const [loading, setLoading] = useState(false);
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
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { product_id: '', quantity: '', unit: 'un' },
  ]);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [createProductForIndex, setCreateProductForIndex] = useState<number | null>(null);

  useEffect(() => {
    const api = getApiClient();
    api.getRecipeProducts({ limit: '500' }).then((res: any) => {
      setProducts(res.data || []);
    }).catch(() => {});
  }, [refreshKey]);

  const addIngredient = () => {
    setIngredients([...ingredients, { product_id: '', quantity: '', unit: 'un' }]);
  };

  const outputProducts = products.filter(p => p.sellable === true);
  const ingredientProducts = products.filter(p => p.sellable !== true);

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
    if (ingredients.every(i => !i.product_id)) { toast.error('Al menos un ingrediente requerido'); return; }

    setLoading(true);
    try {
      const api = getApiClient();
      await api.createFormula({
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
      toast.success('Receta creada exitosamente');
      router.push('/recetas');
    } catch (err) {
      toast.error('Error al crear receta');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Nueva Receta</h1>
          <p className="text-sm text-muted-foreground mt-1">Definir ingredientes y cantidades para producción</p>
        </div>
        <Link href="/recetas"
          className="bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                placeholder="Ej: Torta de Manjar" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Producto de Salida</label>
              <select value={form.output_product_id} onChange={e => setForm(p => ({ ...p, output_product_id: e.target.value }))}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                <option value="">Ninguno (solo descontar)</option>
                {outputProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Rendimiento</label>
              <div className="flex gap-2">
                <input type="number" step="0.01" value={form.yield_quantity} onChange={e => setForm(p => ({ ...p, yield_quantity: e.target.value }))}
                  className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                  placeholder="1" />
                <select value={form.yield_unit} onChange={e => setForm(p => ({ ...p, yield_unit: e.target.value }))}
                  className="w-24 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
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
              <label className="block text-xs font-medium text-foreground">Descripción</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                placeholder="Descripción de la receta..." />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Margen Mínimo (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={form.min_margin_pct} onChange={e => setForm(p => ({ ...p, min_margin_pct: e.target.value }))}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                placeholder="Ej: 10" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Margen Máximo (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={form.max_margin_pct} onChange={e => setForm(p => ({ ...p, max_margin_pct: e.target.value }))}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                placeholder="Ej: 60" />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Ingredientes</h3>
            <button type="button" onClick={addIngredient}
              className="bg-card border border-border hover:bg-muted text-foreground px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
              <div className="col-span-5">Producto</div>
              <div className="col-span-3">Cantidad</div>
              <div className="col-span-2">Unidad</div>
              <div className="col-span-2"></div>
            </div>
            {ingredients.map((ing, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5 flex gap-1">
                  <select value={ing.product_id} onChange={e => updateIngredient(i, 'product_id', e.target.value)}
                    className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                    <option value="">Seleccionar...</option>
                    {ingredientProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <button type="button" onClick={() => { setCreateProductForIndex(i); setShowCreateProduct(true); }}
                    className="px-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-medium transition-colors shrink-0"
                    title="Crear nuevo ingrediente">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="col-span-3">
                  <input type="number" step="0.001" value={ing.quantity} onChange={e => updateIngredient(i, 'quantity', e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                    placeholder="0.000" />
                </div>
                <div className="col-span-2">
                  <select value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                    <option value="un">un</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
                <div className="col-span-2 flex justify-center">
                  <button type="button" onClick={() => removeIngredient(i)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
          <Link href="/recetas"
            className="bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Creando...' : 'Crear Receta'}
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
