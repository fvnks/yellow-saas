'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, CheckCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface CountDetail {
  id: string;
  count_number: string;
  status: string;
  count_type: string;
  warehouse: { id: string; name: string; code: string };
  started_at: string | null;
  completed_at: string | null;
  items: Array<{
    id: string;
    product_id: string;
    system_quantity: number;
    counted_quantity: number | null;
    difference: number | null;
    status: string;
    notes: string | null;
    product: { id: string; name: string; sku: string; cost_price: number };
  }>;
}

export default function InventoryCountDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const countId = params.id;
  const [count, setCount] = useState<CountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingItem, setSavingItem] = useState<string | null>(null);

  useEffect(() => {
    if (countId) fetchCount();
  }, [countId]);

  const fetchCount = async () => {
    try {
      const api = getApiClient();
      const data = await api.getInventoryCount(countId!);
      setCount(data);
    } catch (err) {
      toast.error('Error al cargar conteo');
    } finally {
      setLoading(false);
    }
  };

  const updateCountedQty = async (itemId: string, qty: string) => {
    if (!count) return;
    setSavingItem(itemId);
    try {
      const api = getApiClient();
      await api.updateInventoryCountItem(count.id, itemId, {
        counted_quantity: parseFloat(qty) || 0,
      });
      await fetchCount();
    } catch (err) {
      toast.error('Error al actualizar cantidad');
    } finally {
      setSavingItem(null);
    }
  };

  const handleStart = async () => {
    const api = getApiClient();
    await api.startInventoryCount(countId!);
    await fetchCount();
  };

  const handleComplete = async () => {
    const uncounted = count?.items.filter(i => i.counted_quantity === null).length || 0;
    if (uncounted > 0) {
      toast.warning('Faltan productos por contar');
      return;
    }
    const api = getApiClient();
    await api.completeInventoryCount(countId!);
    await fetchCount();
  };

  const filteredItems = count?.items.filter(item =>
    item.product.name.toLowerCase().includes(search.toLowerCase()) ||
    item.product.sku.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const itemsWithDiff = count?.items.filter(i => i.counted_quantity !== null && i.difference !== 0).length || 0;
  const itemsCounted = count?.items.filter(i => i.counted_quantity !== null).length || 0;
  const totalItems = count?.items.length || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border">
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!count) return <div className="text-muted-foreground text-sm">Conteo no encontrado</div>;

  const statusLabels: Record<string, string> = {
    draft: 'Borrador',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/dashboard/inventory/counts')} className="p-1 hover:bg-muted rounded transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{count.count_number}</h1>
          <p className="text-sm text-muted-foreground">{count.warehouse.name} &middot; {statusLabels[count.status]}</p>
        </div>
        {count.status === 'draft' && (
          <button onClick={handleStart} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-150 active:scale-[0.98]">
            <Play className="w-4 h-4" /> Iniciar Conteo
          </button>
        )}
        {count.status === 'in_progress' && (
          <button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <CheckCircle className="w-4 h-4" /> Completar y Ajustar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: totalItems },
          { label: 'Contados', value: itemsCounted },
          { label: 'Diferencias', value: itemsWithDiff },
          { label: 'Progreso', value: `${totalItems ? Math.round((itemsCounted / totalItems) * 100) : 0}%` },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-border">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Sistema</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Contado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Diferencia</th>
                {count.status === 'in_progress' && (
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const diff = item.counted_quantity !== null ? item.counted_quantity - item.system_quantity : null;
                return (
                  <tr key={item.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-foreground">{item.product.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[9px] font-mono text-muted-foreground">{item.product.sku}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-foreground font-mono">{item.system_quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {count.status === 'in_progress' ? (
                        <input
                          type="number"
                          defaultValue={item.counted_quantity ?? ''}
                          onBlur={(e) => updateCountedQty(item.id, e.target.value)}
                          disabled={savingItem === item.id}
                          className="w-20 text-right bg-muted border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                        />
                      ) : (
                        <span className="text-xs text-foreground font-mono">
                          {item.counted_quantity ?? '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {diff !== null && (
                        <span className={`text-xs font-semibold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                          {diff > 0 ? '+' : ''}{diff}
                        </span>
                      )}
                    </td>
                    {count.status === 'in_progress' && (
                      <td className="px-4 py-3 text-center">
                        {savingItem === item.id && <span className="text-[9px] text-muted-foreground">Guardando...</span>}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
