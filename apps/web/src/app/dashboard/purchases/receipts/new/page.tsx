'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, PackageCheck, AlertCircle } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface PurchaseOrderOption {
  id: string;
  number: string;
  status: string;
  total_amount: number;
  supplier: { id: string; name: string } | null;
  warehouse: { id: string; name: string; code: string } | null;
  items: {
    id: string;
    product_id: string;
    quantity: number;
    received_quantity: number;
    unit_price: number;
    product: { id: string; name: string; sku: string } | null;
  }[];
}

interface ReceiveItem {
  purchase_order_item_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  ordered_quantity: number;
  already_received: number;
  quantity_to_receive: number;
  batch_number: string;
}

export default function NewGoodsReceiptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const [orders, setOrders] = useState<PurchaseOrderOption[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderOption | null>(null);
  const [receiveItems, setReceiveItems] = useState<ReceiveItem[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const api = getApiClient();
    api.getPurchaseOrders({ status: 'confirmed', limit: '500' })
      .then(async (d) => {
        const basicOrders = d.data || [];
        const fullOrders = await Promise.all(
          basicOrders.map((o: any) => api.getPurchaseOrder(o.id).catch(() => o))
        );
        setOrders(fullOrders as PurchaseOrderOption[]);
      })
      .catch(() => {});
  }, []);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setReceiveItems(
        order.items
          .filter(item => item.quantity > (item.received_quantity || 0))
          .map(item => ({
            purchase_order_item_id: item.id,
            product_id: item.product_id,
            product_name: item.product?.name || '',
            product_sku: item.product?.sku || '',
            ordered_quantity: item.quantity,
            already_received: item.received_quantity || 0,
            quantity_to_receive: item.quantity - (item.received_quantity || 0),
            batch_number: '',
          }))
      );
      setStep(2);
    }
  };

  const handleQuantityChange = (index: number, value: string) => {
    const qty = parseInt(value) || 0;
    setReceiveItems(prev => {
      const updated = [...prev];
      const maxQty = updated[index].ordered_quantity - updated[index].already_received;
      updated[index].quantity_to_receive = Math.min(qty, Math.max(0, maxQty));
      return updated;
    });
  };

  const handleBatchChange = (index: number, value: string) => {
    setReceiveItems(prev => {
      const updated = [...prev];
      updated[index].batch_number = value;
      return updated;
    });
  };

  const totalItemsToReceive = receiveItems.reduce((sum, item) => sum + item.quantity_to_receive, 0);

  const handleSubmit = async () => {
    if (!selectedOrder || totalItemsToReceive === 0) return;
    setSaving(true);
    setError('');
    try {
      const api = getApiClient();
      const receipt = await api.createGoodsReceipt({
        purchase_order_id: selectedOrder.id,
        supplier_id: selectedOrder.supplier?.id,
        warehouse_id: selectedOrder.warehouse?.id,
        status: 'pending',
        notes: notes || undefined,
      }) as any;

      const receiptId = receipt?.id || receipt?.data?.id;

      const itemsToSend = receiveItems.filter(i => i.quantity_to_receive > 0).map(i => {
        const poItem = selectedOrder.items.find(pi => pi.id === i.purchase_order_item_id);
        return {
          purchase_order_item_id: i.purchase_order_item_id,
          product_id: i.product_id,
          quantity: i.quantity_to_receive,
          unit_price: poItem?.unit_price || 0,
        };
      });

      await api.updateGoodsReceipt(receiptId, { items: itemsToSend });

      router.push('/dashboard/purchases/receipts');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear recepción');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => step === 2 ? setStep(1) : router.push('/dashboard/purchases/receipts')}
          className="p-1 hover:bg-muted rounded transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Nueva Recepción de Mercadería</h1>
          <p className="text-sm text-muted-foreground mt-1">{step === 1 ? 'Seleccionar orden de compra' : `Recibir items de ${selectedOrder?.number || ''}`}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {step === 1 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-slate-800">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-foreground">Órdenes de Compra Confirmadas</h3>
            <p className="text-xs text-muted-foreground mt-1">Selecciona una orden de compra para recepcionar</p>
          </div>
          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No hay órdenes de compra confirmadas disponibles</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <button
                    key={order.id}
                    onClick={() => handleSelectOrder(order.id)}
                    className="w-full text-left p-4 border border-border rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{order.number}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.supplier?.name || 'Sin proveedor'} · {order.warehouse?.name || 'Sin bodega'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          ${order.total_amount?.toLocaleString('es-CL') || '0'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-foreground">Items a Recibir</h3>
              <p className="text-xs text-muted-foreground mt-1">Ingresa las cantidades a recibir para cada producto</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider w-24">Ordenado</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider w-28">Ya Recibido</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider w-32">Por Recibir</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider w-32">A Recibir</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider w-36">N° Lote</th>
                  </tr>
                </thead>
                <tbody>
                  {receiveItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Todos los items de esta orden ya han sido recepcionados
                      </td>
                    </tr>
                  ) : (
                    receiveItems.map((item, index) => (
                      <tr key={item.purchase_order_item_id} className="border-b border-slate-100 hover:bg-muted transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-foreground">{item.product_name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{item.product_sku}</p>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-foreground">{item.ordered_quantity}</td>
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">{item.already_received}</td>
                        <td className="px-4 py-3 text-center text-xs text-foreground font-medium">
                          {item.ordered_quantity - item.already_received}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max={item.ordered_quantity - item.already_received}
                            value={item.quantity_to_receive}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.batch_number}
                            onChange={(e) => handleBatchChange(index, e.target.value)}
                            placeholder="Opcional"
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-foreground">Observaciones</h3>
            </div>
            <div className="p-6">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Notas sobre la recepción..."
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors resize-none"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-foreground">Resumen de Recepción</p>
                <p className="text-xs text-muted-foreground mt-1">Total de unidades a recibir</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{totalItemsToReceive}</p>
                <p className="text-xs text-muted-foreground">unidades</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 bg-card border border-border hover:bg-muted text-foreground dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Volver
              </button>
              <button onClick={handleSubmit} disabled={saving || totalItemsToReceive === 0}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Recepción'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
