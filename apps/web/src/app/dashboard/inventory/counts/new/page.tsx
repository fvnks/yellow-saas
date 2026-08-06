'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface WarehouseItem {
  id: string;
  name: string;
  code: string;
  is_default?: boolean;
}

export default function NewInventoryCountPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [warehouseId, setWarehouseId] = useState('');
  const [countType, setCountType] = useState('full');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const api = getApiClient();
      const data = await api.getWarehouses({ limit: '100' });
      const list = data.data || [];
      setWarehouses(list);
      if (list.length === 1) setWarehouseId(list[0].id);
    } catch (err) {
      toast.error('Error al cargar bodegas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) return;
    setSubmitting(true);
    try {
      const api = getApiClient();
      const count = await api.createInventoryCount({
        warehouse_id: warehouseId,
        count_type: countType,
        notes,
      });
      router.push(`/dashboard/inventory/counts/${count.id}`);
    } catch (err) {
      toast.error('Error al crear conteo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Nuevo Conteo de Inventario</h1>
        <p className="text-sm text-muted-foreground mt-1">Selecciona bodega y tipo de conteo</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border space-y-6">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-foreground">Bodega *</label>
          {loading ? (
            <div className="h-10 bg-muted rounded-lg animate-pulse" />
          ) : (
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              required
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
            >
              <option value="">Seleccionar bodega...</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-foreground">Tipo de Conteo *</label>
          <select
            value={countType}
            onChange={(e) => setCountType(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
          >
            <option value="full">Inventario Full</option>
            <option value="partial">Parcial</option>
            <option value="cycle">Ciclico</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-foreground">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Motivo del conteo..."
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/inventory/counts')}
            className="bg-card border border-border hover:bg-muted text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!warehouseId || submitting}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Creando...' : 'Crear Conteo'}
          </button>
        </div>
      </form>
    </div>
  );
}
