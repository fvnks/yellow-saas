'use client';

import { useState } from 'react';
import { INITIAL_ORDERS, Order, OrderItem } from '../lib/restaurant-store';
import { Wine, Clock, CheckCircle2, GlassWater, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { useRestaurantRole } from '../lib/role-context';
import RoleProtected from '../components/role-protected';

export default function KDSBarPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const { canAccess } = useRestaurantRole();
  if (!canAccess('bar')) return <RoleProtected section="bar"><div /></RoleProtected>;

  // Filter only items destined for bar station
  const barOrders = orders
    .map(order => ({
      ...order,
      items: order.items.filter(item => item.station === 'bar'),
    }))
    .filter(order => order.items.length > 0 && order.status === 'active');

  const handleUpdateItemStatus = (orderId: string, itemId: string, nextStatus: OrderItem['status']) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updatedItems = o.items.map(item => (item.id === itemId ? { ...item, status: nextStatus } : item));
        return { ...o, items: updatedItems };
      })
    );

    const statusLabel = nextStatus === 'preparing' ? 'En Barra' : nextStatus === 'ready' ? 'Listo para Servir' : 'Pendiente';
    toast.success(`Bar: ${statusLabel}`);
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Wine className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold">Pantalla KDS Bar & Bebidas</h1>
              <p className="text-xs text-slate-400">
                Visualización exclusiva de comanda de tragos, pisco sour, vinos, café y bebidas.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-xl font-bold">
            {barOrders.flatMap(o => o.items).filter(i => i.status !== 'ready').length} Tragos Pendientes
          </span>
        </div>
      </div>

      {/* Bar Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barOrders.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white border border-slate-200/80 rounded-2xl p-8 space-y-3">
            <Wine className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">Sin bebidas en preparación</h3>
            <p className="text-xs text-slate-400">Los nuevos pedidos de bar y cafetería se actualizarán en vivo aquí.</p>
          </div>
        ) : (
          barOrders.map(order => {
            const allItemsReady = order.items.every(i => i.status === 'ready');

            return (
              <div
                key={order.id}
                className={`bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between transition-all ${
                  allItemsReady ? 'border-purple-300 bg-purple-50/20' : 'border-slate-200/80'
                }`}
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-200/80 bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">{order.tableName}</h3>
                    <p className="text-[11px] text-slate-400">PIN: {order.pinCode} • Hora: {order.createdAt}</p>
                  </div>
                  <span className="font-mono text-xs font-bold bg-purple-500 text-white px-2 py-0.5 rounded">
                    {order.id}
                  </span>
                </div>

                {/* Items */}
                <div className="p-4 space-y-3 flex-1">
                  {order.items.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {item.quantity}x {item.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] mt-1">
                          <span
                            className={`font-semibold capitalize px-2 py-0.5 rounded ${
                              item.status === 'ready'
                                ? 'bg-purple-100 text-purple-800'
                                : item.status === 'preparing'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {item.status === 'ready'
                              ? '✓ Listo'
                              : item.status === 'preparing'
                              ? '🍸 Preparando'
                              : 'Pendiente'}
                          </span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col gap-1">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateItemStatus(order.id, item.id, 'preparing')}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 transition-all"
                          >
                            <GlassWater className="w-3.5 h-3.5" /> Preparar
                          </button>
                        )}
                        {item.status === 'preparing' && (
                          <button
                            onClick={() => handleUpdateItemStatus(order.id, item.id, 'ready')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Marcar Listo
                          </button>
                        )}
                        {item.status === 'ready' && (
                          <span className="text-purple-700 font-bold text-xs">Listo en Barra</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Transcurrido: ~3 min
                  </span>
                  {allItemsReady && (
                    <span className="text-purple-700 font-bold font-sans">Tragos Listos ✓</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
