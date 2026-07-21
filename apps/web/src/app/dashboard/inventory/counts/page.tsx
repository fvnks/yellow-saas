'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, Plus, Search, Eye, Play, CheckCircle } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface CountItem {
  id: string;
  count_number: string;
  status: string;
  count_type: string;
  warehouse: { id: string; name: string; code: string };
  items_count: number;
  counted_items: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  draft: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Borrador' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'En Progreso' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Completado' },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Cancelado' },
};

const typeLabels: Record<string, string> = {
  full: 'Inventario Full',
  partial: 'Parcial',
  cycle: 'Ciclico',
};

export default function InventoryCountsPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<CountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '100' };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const data = await api.getInventoryCounts(params);
      setCounts(data.data || []);
    } catch (err) {
      toast.error('Error al cargar conteos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [statusFilter, search]);

  useEffect(() => {
    fetchCounts();
  }, [statusFilter, search]);

  const getProgress = (item: CountItem) => {
    if (!item.items_count) return 0;
    return Math.round((item.counted_items / item.items_count) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Conteos de Inventario</h1>
          <p className="text-sm text-slate-500 mt-1">Control de inventario fisico</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/inventory/counts/new')}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Conteo
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por numero o bodega..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 border-b border-slate-100">
              <div className="animate-pulse flex gap-4">
                <div className="h-4 bg-slate-200 rounded w-32"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : counts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">No hay conteos de inventario</p>
          <button
            onClick={() => router.push('/dashboard/inventory/counts/new')}
            className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Crear primer conteo
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Numero</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Progreso</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {counts.map((count) => {
                  const status = statusConfig[count.status] || statusConfig.draft;
                  const progress = getProgress(count);
                  return (
                    <tr key={count.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono font-semibold text-slate-900">{count.count_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-700">{count.warehouse.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600">{typeLabels[count.count_type] || count.count_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[9px] text-slate-500">{count.counted_items}/{count.items_count}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${status.bg} ${status.text} border ${status.border}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">
                          {new Date(count.created_at).toLocaleDateString('es-CL')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/inventory/counts/${count.id}`)}
                            className="text-slate-600 hover:text-slate-900 p-1 rounded transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {count.status === 'draft' && (
                            <button
                              onClick={async () => {
                                const api = getApiClient();
                                await api.startInventoryCount(count.id);
                                fetchCounts();
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                              title="Iniciar conteo"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
