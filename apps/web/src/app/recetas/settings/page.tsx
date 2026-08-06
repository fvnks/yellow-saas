'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Package, ArrowLeft } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRecetasRefresh } from '@/components/recetas/RefreshContext';

export default function RecetasSettingsPage() {
  const { refreshKey } = useRecetasRefresh();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, number>>({});

  useEffect(() => {
    const api = getApiClient();
    api.getRecipeProducts({ limit: '500' }).then((res: any) => {
      setProducts(res.data || []);
      setLoading(false);
    }).catch(() => {
      toast.error('Error al cargar productos');
      setLoading(false);
    });
  }, [refreshKey]);

  const handleMinStockChange = (productId: string, value: string) => {
    const num = parseFloat(value) || 0;
    setChanges(prev => ({ ...prev, [productId]: num }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const api = getApiClient();
      const entries = Object.entries(changes);
      if (entries.length === 0) {
        toast.info('Sin cambios para guardar');
        setSaving(false);
        return;
      }

      await Promise.all(
        entries.map(([id, min_stock]) => api.updateRecipeProduct(id, { min_stock }))
      );

      toast.success(`${entries.length} producto(s) actualizado(s)`);
      setChanges({});

      const res = await api.getRecipeProducts({ limit: '500' });
      setProducts(res.data || []);
    } catch {
      toast.error('Error al guardar');
    }
    setSaving(false);
  };

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/recetas/inventory"
            className="bg-card border border-border hover:bg-muted text-foreground p-2 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Configuración de Stock</h1>
            <p className="text-sm text-muted-foreground mt-1">Define el stock mínimo para cada producto — el semáforo cambiará a rojo cuando se alcance</p>
          </div>
        </div>
        {hasChanges && (
          <button onClick={handleSave} disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : `Guardar (${Object.keys(changes).length})`}
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-foreground mb-2">Semáforo de Stock</p>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> OK — por encima del mínimo
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Bajo — entre 50% y 100% del mínimo
          </span>
          <span className="inline-flex items-center gap-1.5 text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Crítico — por debajo del 50% del mínimo
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-muted" /> Sin configurar
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Unidad</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Stock Actual</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider w-32">Stock Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={5} className="px-4 py-3"><div className="h-5 bg-muted rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Package className="w-10 h-10 text-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No hay productos registrados</p>
                  </td>
                </tr>
              ) : products.map(p => {
                const stock = Number(p.stock) || 0;
                const currentMin = Number(p.min_stock) || 0;
                const pendingMin = changes[p.id] !== undefined ? changes[p.id] : currentMin;
                const isDirty = changes[p.id] !== undefined && changes[p.id] !== currentMin;

                return (
                  <tr key={p.id} className={`border-b border-border transition-colors ${isDirty ? 'bg-blue-50/50' : 'hover:bg-muted'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-medium text-foreground">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground font-mono">{p.sku}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{p.unit_of_measure}</td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-foreground">{stock.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={pendingMin || ''}
                        onChange={e => handleMinStockChange(p.id, e.target.value)}
                        className="w-24 bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-40">
          <button onClick={handleSave} disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-xl transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> Guardar cambios ({Object.keys(changes).length})
          </button>
        </div>
      )}
    </div>
  );
}
