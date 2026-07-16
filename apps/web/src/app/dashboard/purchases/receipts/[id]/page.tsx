'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Package, Truck, Warehouse, Calendar, Trash2, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';

interface ReceiptItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name: string;
  sku: string;
  ordered_quantity: number;
  batch_number?: string;
}

interface GoodsReceiptDetail {
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
  items: ReceiptItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Clock },
  received: { label: 'Recibido', color: 'bg-blue-50 text-blue-700 border border-blue-200', icon: CheckCircle },
  completed: { label: 'Completado', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-rose-50 text-rose-700 border border-rose-200', icon: Trash2 },
};

export default function GoodsReceiptDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [receipt, setReceipt] = useState<GoodsReceiptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const api = getApiClient();
    const companyId = api['companyId'];
    fetch(`/api/companies/${companyId}/goods-receipts/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(res => {
        setReceipt(res.data || res);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar la recepción');
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta recepción de mercadería?')) return;
    setDeleting(true);
    try {
      const api = getApiClient();
      const companyId = api['companyId'];
      const res = await fetch(`/api/companies/${companyId}/goods-receipts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Error al eliminar');
        setDeleting(false);
        return;
      }
      router.push('/dashboard/purchases/receipts');
    } catch {
      alert('Error al eliminar');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="h-48 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="h-32 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="h-32 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/purchases/receipts" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Recepción no encontrada</h1>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm text-slate-500">{error || 'La recepción solicitada no existe.'}</p>
          <Link href="/dashboard/purchases/receipts">
            <button className="mt-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Volver a Recepciones
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[receipt.status] || { label: receipt.status, color: 'bg-slate-100 text-slate-600 border border-slate-200', icon: Clock };
  const items = receipt.items || [];
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalOrdered = items.reduce((sum, item) => sum + item.ordered_quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/purchases/receipts" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">Detalle de Recepción</h1>
            <span className="text-sm font-mono text-slate-500">{receipt.receipt_number}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold ${status.color}`}>
              <status.icon className="w-3 h-3" />
              {status.label}
            </span>
            <span className="text-xs text-slate-400">
              {receipt.received_date || 'Sin fecha'}
            </span>
          </div>
        </div>
        {receipt.status === 'pending' && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Información de la Recepción</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Orden de Compra</p>
                    <Link
                      href={`/dashboard/purchases/${receipt.purchase_order_id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      {receipt.order_number || '—'}
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proveedor</p>
                    <p className="text-sm font-medium text-slate-900">{receipt.supplier_name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Warehouse className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</p>
                    <p className="text-sm font-medium text-slate-900">{receipt.warehouse_name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha de Recepción</p>
                    <p className="text-sm font-medium text-slate-900">{receipt.received_date || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Items Recibidos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cant. Pedida</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cant. Recibida</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nro. Lote</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-medium text-slate-900">{item.product_name || 'Producto'}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{item.sku || item.product_id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-slate-700">{item.ordered_quantity}</td>
                      <td className="px-4 py-3 text-center">
                        {item.quantity >= item.ordered_quantity ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle className="w-3 h-3" />
                            {item.quantity}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-amber-600">{item.quantity}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700 font-mono">{item.batch_number || '—'}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">No hay items en esta recepción</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {receipt.notes && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Notas</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-700">{receipt.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm sticky top-24">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Resumen</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Total Items</span>
                  <span className="font-medium text-slate-900">{items.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Unidades Recibidas</span>
                  <span className="font-medium text-slate-900">{totalQty}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Unidades Pedidas</span>
                  <span className="font-medium text-slate-900">{totalOrdered}</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Progreso</span>
                  <span className={`font-medium ${totalQty >= totalOrdered ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {totalOrdered > 0 ? Math.round((totalQty / totalOrdered) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Creado:</span>
                  <span className="font-medium">{receipt.created_at?.split('T')[0] || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
