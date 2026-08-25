'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Eye, Trash2, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface GoodsReceipt {
  id: string;
  receipt_number: string;
  purchase_order_id: string;
  supplier_id: string;
  warehouse_id: string;
  status: string;
  received_date: string;
  notes: string | null;
  created_by: string | null;
  supplier_name: string;
  warehouse_name: string;
  order_number: string;
  created_at: string;
  items?: { id: string; quantity: number }[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  received: { label: 'Recibido', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  completed: { label: 'Completado', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  cancelled: { label: 'Cancelado', color: 'bg-rose-50 text-rose-700 border border-rose-200' },
};

export default function GoodsReceiptsPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [kpis, setKpis] = useState({ total: 0, pending: 0, completed: 0, thisMonth: 0 });

  useEffect(() => { fetchReceipts(); }, [search, statusFilter]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const result = await api.getGoodsReceipts({
        status: statusFilter || undefined,
        search: search || undefined,
      }) as any;
      const list = result.data || [];
      setReceipts(list);
      setTotal(result.pagination?.total || list.length);

      const now = new Date();
      const thisMonth = list.filter((r: GoodsReceipt) => {
        const d = new Date(r.received_date || r.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      setKpis({
        total: result.pagination?.total || list.length,
        pending: list.filter((r: GoodsReceipt) => r.status === 'pending').length,
        completed: list.filter((r: GoodsReceipt) => r.status === 'completed').length,
        thisMonth,
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta recepción?')) return;
    try {
      const api = getApiClient();
      await api.deleteGoodsReceipt(id);
      fetchReceipts();
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: status, color: 'bg-muted text-foreground border border-border' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/dashboard/purchases')} className="p-1 hover:bg-muted rounded transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Recepción de Mercadería</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} recepciones</p>
        </div>
        <button onClick={() => router.push('/dashboard/purchases/receipts/new')}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nueva Recepción
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total Recepciones</p>
              <p className="text-2xl font-bold text-foreground mt-1">{kpis.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <PackageCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Pendientes</p>
              <p className="text-2xl font-bold text-foreground mt-1">{kpis.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <PackageCheck className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Completadas</p>
              <p className="text-2xl font-bold text-foreground mt-1">{kpis.completed}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <PackageCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Este Mes</p>
              <p className="text-2xl font-bold text-foreground mt-1">{kpis.thisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <PackageCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar por número, proveedor o bodega..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="received">Recibido</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : receipts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-12 dark:bg-primary dark:border-border text-center">
          <PackageCheck className="w-12 h-12 text-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No hay recepciones de mercadería</p>
          <button onClick={() => router.push('/dashboard/purchases/receipts/new')}
            className="mt-4 text-primary hover:text-primary text-sm font-medium">Crear primera recepción</button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Recepción #</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">OC #</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Proveedor</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Bodega</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map(r => (
                  <tr key={r.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-foreground font-mono">{r.receipt_number}</td>
                    <td className="px-4 py-3 text-xs text-foreground font-mono">{r.order_number || '-'}</td>
                    <td className="px-4 py-3 text-xs text-foreground max-w-[160px] truncate">{r.supplier_name || '-'}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{r.warehouse_name || '-'}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{r.received_date || '-'}</td>
                    <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => router.push(`/dashboard/purchases/receipts/${r.id}`)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {r.status === 'pending' && (
                          <button onClick={() => handleDelete(r.id)}
                            className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {receipts.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>Mostrando {receipts.length} de {total}</p>
        </div>
      )}
    </div>
  );
}
