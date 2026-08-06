'use client';

import { useState } from 'react';
import { X, Plus, Package } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface QuickCreateProductProps {
  open: boolean;
  onClose: () => void;
  onCreated: (product: { id: string; name: string; sku: string }) => void;
}

export default function QuickCreateProduct({ open, onClose, onCreated }: QuickCreateProductProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    unit_of_measure: 'UN',
    cost_price: '',
    sale_price: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nombre requerido'); return; }
    if (!form.sku.trim()) { toast.error('SKU requerido'); return; }

    setLoading(true);
    try {
      const api = getApiClient();
      const result = await api.createRecipeProduct({
        name: form.name.trim(),
        sku: form.sku.trim(),
        unit_of_measure: form.unit_of_measure,
        cost_price: form.cost_price ? parseFloat(form.cost_price) : 0,
        sale_price: form.sale_price ? parseFloat(form.sale_price) : 0,
      });
      toast.success('Ingrediente creado');
      onCreated({ id: result.id, name: form.name.trim(), sku: form.sku.trim() });
      setForm({ name: '', sku: '', unit_of_measure: 'UN', cost_price: '', sale_price: '' });
      onClose();
    } catch {
      toast.error('Error al crear ingrediente');
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Nuevo Ingrediente</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Nombre *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="Ej: Harina de trigo" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">SKU *</label>
              <input type="text" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent font-mono"
                placeholder="ING-001" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Unidad</label>
              <select value={form.unit_of_measure} onChange={e => setForm(p => ({ ...p, unit_of_measure: e.target.value }))}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
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
              <label className="block text-xs font-medium text-foreground">Costo Unitario</label>
              <input type="number" step="1" min="0" value={form.cost_price} onChange={e => setForm(p => ({ ...p, cost_price: e.target.value }))}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Precio Venta</label>
              <input type="number" step="1" min="0" value={form.sale_price} onChange={e => setForm(p => ({ ...p, sale_price: e.target.value }))}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                placeholder="0" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
              <Plus className="w-4 h-4" /> {loading ? 'Creando...' : 'Crear Ingrediente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
