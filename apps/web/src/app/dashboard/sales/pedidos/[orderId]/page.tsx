'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Clock, CheckCircle2, XCircle, Truck, AlertTriangle, Save } from 'lucide-react';
import { Badge } from '@yellow-erp/ui';

interface OrderDetail {
  id: string;
  order_number: string;
  warehouse_name: string;
  requested_by_name: string;
  status: string;
  priority: string;
  notes: string;
  created_at: string;
  approved_at: string;
  completed_at: string;
  items: {
    id: string;
    product_name: string;
    sku: string;
    quantity: number;
    fulfilled_quantity: number;
    notes: string;
  }[];
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; icon: any }> = {
  draft: { label: 'Borrador', variant: 'neutral', icon: Package },
  pending: { label: 'Pendiente', variant: 'warning', icon: Clock },
  approved: { label: 'Aprobado', variant: 'info', icon: CheckCircle2 },
  picking: { label: 'En Despacho', variant: 'info', icon: Truck },
  completed: { label: 'Completado', variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', variant: 'danger', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-muted text-foreground' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-600' },
  high: { label: 'Alta', color: 'bg-amber-100 text-amber-600' },
  urgent: { label: 'Urgente', color: 'bg-rose-100 text-rose-600' },
};

export default function PedidoDetailPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fulfilledMap, setFulfilledMap] = useState<Record<string, number>>({});

  const loadOrder = useCallback(async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/internal-orders/${params.orderId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar pedido');
      setOrder(data.data);
      const map: Record<string, number> = {};
      (data.data.items || []).forEach((item: any) => { map[item.id] = item.fulfilled_quantity || 0; });
      setFulfilledMap(map);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }, [params.orderId]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/internal-orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadOrder();
    } catch { alert('Error al actualizar estado'); }
  };

  const saveFulfilled = async () => {
    if (!order) return;
    try {
      const companyId = localStorage.getItem('company_id');
      const fulfilled_items = Object.entries(fulfilledMap).map(([id, fulfilled_quantity]) => ({ id, fulfilled_quantity }));
      await fetch(`/api/companies/${companyId}/internal-orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfilled_items }),
      });
      loadOrder();
    } catch { alert('Error al guardar cantidades'); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        <div className="bg-card border border-border rounded-xl p-8">
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.push('/dashboard/sales/pedidos')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Volver a Pedidos
        </button>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="text-sm text-foreground">{error || 'Pedido no encontrado'}</p>
        </div>
      </div>
    );
  }

  const st = statusConfig[order.status] || { label: order.status, variant: 'neutral' as const, icon: Package };
  const pr = priorityConfig[order.priority] || { label: order.priority, color: 'bg-muted text-foreground' };
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
  const totalFulfilled = order.items.reduce((s, i) => s + (fulfilledMap[i.id] || 0), 0);
  const isFullyFulfilled = order.items.length > 0 && totalFulfilled >= totalQty;

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/dashboard/sales/pedidos')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver a Pedidos
      </button>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Detalle del Pedido</h1>
            <span className="text-sm font-mono text-muted-foreground">{order.order_number}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={st.variant}>{st.label}</Badge>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${pr.color}`}>{pr.label}</span>
          </div>
        </div>
        {order.status === 'pending' && (
          <div className="flex items-center gap-2">
            <button onClick={() => updateStatus('cancelled')}
              className="bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <XCircle className="w-4 h-4" /> Rechazar
            </button>
            <button onClick={() => updateStatus('approved')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Aprobar
            </button>
          </div>
        )}
        {order.status === 'approved' && (
          <button onClick={() => updateStatus('picking')}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-150 active:scale-[0.98]">
            <Truck className="w-4 h-4" /> Iniciar Despacho
          </button>
        )}
        {order.status === 'picking' && (
          <div className="flex items-center gap-2">
            {isFullyFulfilled && (
              <button onClick={() => updateStatus('completed')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                <CheckCircle2 className="w-4 h-4" /> Completar
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Productos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider w-24">Solicitado</th>
                    {order.status === 'picking' && (
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider w-28">Despachado</th>
                    )}
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => {
                    const fulfilled = fulfilledMap[item.id] || 0;
                    const pct = item.quantity > 0 ? Math.round((fulfilled / item.quantity) * 100) : 0;
                    return (
                      <tr key={item.id} className="border-b border-border hover:bg-muted transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-foreground">{item.product_name}</p>
                          <p className="text-[9px] text-muted-foreground font-mono">{item.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-medium text-foreground">{item.quantity}</td>
                        {order.status === 'picking' && (
                          <td className="px-4 py-3">
                            <input type="number" min="0" max={item.quantity} value={fulfilledMap[item.id] || 0}
                              onChange={e => setFulfilledMap(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                              className="w-full bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                            <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3 text-xs text-muted-foreground">{item.notes || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {order.status === 'picking' && (
              <div className="px-6 py-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{totalFulfilled} de {totalQty} unidades despachadas</span>
                <button onClick={saveFulfilled}
                  className="bg-primary hover:bg-black text-white px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                  <Save className="w-3.5 h-3.5" /> Guardar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Información</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Bodega Destino</p>
                <p className="text-sm text-foreground">{order.warehouse_name || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Solicitante</p>
                <p className="text-sm text-foreground">{order.requested_by_name || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha Solicitud</p>
                <p className="text-sm text-foreground">{new Date(order.created_at).toLocaleDateString('es-CL')}</p>
              </div>
              {order.approved_at && (
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha Aprobación</p>
                  <p className="text-sm text-foreground">{new Date(order.approved_at).toLocaleDateString('es-CL')}</p>
                </div>
              )}
              {order.completed_at && (
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha Completado</p>
                  <p className="text-sm text-foreground">{new Date(order.completed_at).toLocaleDateString('es-CL')}</p>
                </div>
              )}
              <div>
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Productos</p>
                <p className="text-sm text-foreground">{order.items.length} items</p>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Notas</h3>
              <p className="text-sm text-foreground">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
