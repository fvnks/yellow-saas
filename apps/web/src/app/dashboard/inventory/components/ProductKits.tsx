'use client';

import { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Package, DollarSign, X } from 'lucide-react';
import { toast } from 'sonner';

interface KitItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  cost_price: number;
}

interface ProductKit {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  name: string;
  description: string;
  is_active: boolean;
  items: KitItem[];
  sale_price: number;
}

interface ProductKitsProps {
  productId?: string;
}

export default function ProductKits({ productId }: ProductKitsProps) {
  const [kits, setKits] = useState<ProductKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    product_id: productId || '',
    name: '',
    description: '',
    items: [{ product_id: '', quantity: 1 }] as { product_id: string; quantity: number }[],
  });

  useEffect(() => {
    loadKits();
    loadProducts();
  }, []);

  const loadKits = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/product-kits`);
      if (res.ok) {
        const json = await res.json();
        setKits(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/products?limit=200`);
      if (res.ok) {
        const json = await res.json();
        setProducts(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.product_id) {
      toast.error('Nombre y producto son requeridos');
      return;
    }
    if (form.items.length === 0 || form.items.every(i => !i.product_id)) {
      toast.error('Agregue al menos un item');
      return;
    }
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/product-kits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: form.items.filter(i => i.product_id),
        }),
      });
      if (res.ok) {
        toast.success('Kit creado');
        setShowCreate(false);
        setForm({ product_id: productId || '', name: '', description: '', items: [{ product_id: '', quantity: 1 }] });
        loadKits();
      }
    } catch (e) { toast.error('Error al crear kit'); }
  };

  const handleDelete = async (kitId: string) => {
    if (!confirm('Eliminar kit?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/product-kits/${kitId}`, { method: 'DELETE' });
      toast.success('Kit eliminado');
      loadKits();
    } catch (e) { toast.error('Error al eliminar'); }
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] });
  };

  const removeItem = (idx: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...form.items];
    (newItems[idx] as any)[field] = value;
    setForm({ ...form, items: newItems });
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            Kits / Combos ({kits.length})
          </span>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nuevo Kit
        </button>
      </div>

      {showCreate && (
        <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Crear Kit</span>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-slate-200 rounded">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              placeholder="Nombre del kit" />
            {!productId && (
              <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}
                className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                <option value="">Producto padre...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="col-span-2 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              placeholder="Descripcion (opcional)" />
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Componentes</span>
            {form.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}
                  className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <option value="">Componente...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                  min={0.01} step={0.01}
                  className="w-24 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  placeholder="Cant." />
                <button onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={addItem} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              <Plus className="w-3.5 h-3.5" /> Agregar componente
            </button>
          </div>

          <button onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Crear Kit
          </button>
        </div>
      )}

      {kits.length === 0 ? (
        <div className="text-center py-8 bg-muted border border-dashed border-slate-300 rounded-xl">
          <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Sin kits configurados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {kits.map(kit => {
            const totalCost = kit.items?.reduce((sum, item) => sum + (item.cost_price * item.quantity), 0) || 0;
            return (
              <div key={kit.id} className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{kit.name}</p>
                    <p className="text-[9px] text-muted-foreground">{kit.product_name} | {kit.items?.length || 0} componentes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">${totalCost.toFixed(2)}</span>
                    </div>
                    <button onClick={() => handleDelete(kit.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {kit.items && kit.items.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {kit.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-600 bg-muted rounded-lg px-3 py-1.5">
                        <span>{item.product_name}</span>
                        <span className="font-medium">{item.quantity} x ${item.cost_price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
