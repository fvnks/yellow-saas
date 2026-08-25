'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Trash2, ClipboardList, Upload, BarChart3, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { Badge } from '@yellow-erp/ui';

interface InternalOrder {
  id: string;
  order_number: string;
  warehouse_name: string;
  requested_by_name: string;
  status: string;
  priority: string;
  item_count: number;
  notes: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: 'Borrador', variant: 'neutral' },
  pending: { label: 'Pendiente', variant: 'warning' },
  approved: { label: 'Aprobado', variant: 'info' },
  picking: { label: 'En Despacho', variant: 'info' },
  completed: { label: 'Completado', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-muted text-foreground' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-600' },
  high: { label: 'Alta', color: 'bg-amber-100 text-amber-600' },
  urgent: { label: 'Urgente', color: 'bg-rose-100 text-rose-600' },
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<InternalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const ITEMS_PER_PAGE = 15;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { page: String(page), limit: String(ITEMS_PER_PAGE) };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await fetch(`/api/companies/${localStorage.getItem('company_id')}/internal-orders?${new URLSearchParams(params)}`);
      const data = await res.json();
      setOrders(data.data?.data || []);
      setTotal(data.data?.pagination?.total || 0);
    } catch { setOrders([]); }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este pedido?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/internal-orders/${id}`, { method: 'DELETE' });
      loadData();
    } catch { alert('Error al eliminar'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pedidos Internos</h1>
          <p className="text-sm text-muted-foreground mt-1">Solicitudes de productos entre bodegas</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/sales/pedidos/import">
            <button className="bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Upload className="w-4 h-4" /> Importar
            </button>
          </Link>
          <Link href="/dashboard/sales/pedidos/reports">
            <button className="bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <BarChart3 className="w-4 h-4" /> Informes
            </button>
          </Link>
          <Link href="/dashboard/sales/pedidos/new">
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Nuevo Pedido
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar por número o solicitante..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="picking">En Despacho</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">N° Pedido</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Bodega</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Solicitante</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Prioridad</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Cargando...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">No hay pedidos internos</td></tr>
              ) : orders.map(o => {
                const st = statusConfig[o.status] || { label: o.status, variant: 'neutral' as const };
                const pr = priorityConfig[o.priority] || { label: o.priority, color: 'bg-muted text-foreground' };
                return (
                  <tr key={o.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-foreground">{o.order_number}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{o.warehouse_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{o.requested_by_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-foreground text-center">{o.item_count}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${pr.color}`}>{pr.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('es-CL')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/sales/pedidos/${o.id}`}>
                          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"><Eye className="w-4 h-4" /></button>
                        </Link>
                        <button onClick={() => handleDelete(o.id)} className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {total > ITEMS_PER_PAGE && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <p>Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} de {total}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border border-border hover:bg-muted disabled:opacity-40">Anterior</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * ITEMS_PER_PAGE >= total} className="px-3 py-1 rounded border border-border hover:bg-muted disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
