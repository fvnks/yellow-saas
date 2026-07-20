'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@yellow-erp/ui';
import { ArrowLeft, CheckCircle, XCircle, Truck, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface TransferDetail {
  id: string;
  transfer_number: string;
  status: string;
  notes: string | null;
  created_at: string;
  source_warehouse: { id: string; name: string; code: string };
  destination_warehouse: { id: string; name: string; code: string };
  items: {
    id: string;
    product_id: string;
    quantity: number;
    unit_cost: number;
    notes: string | null;
    product: { id: string; name: string; sku: string };
  }[];
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral' }> = {
  draft: { label: 'Borrador', variant: 'neutral' },
  pending: { label: 'Pendiente', variant: 'warning' },
  in_transit: { label: 'En Transito', variant: 'info' },
  delivered: { label: 'Entregada', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'danger' },
};

export default function TransferDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [transfer, setTransfer] = useState<TransferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const api = getApiClient();
    api.getStockTransfer(params.id)
      .then((data) => {
        setTransfer(data as unknown as TransferDetail);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleConfirm = async () => {
    if (!confirm('Confirmar transferencia? Se descontara stock de la bodega origen.')) return;
    setActionLoading(true);
    try {
      const api = getApiClient();
      await api.confirmStockTransfer(params.id);
      router.refresh();
      const updated = await api.getStockTransfer(params.id);
      setTransfer(updated as unknown as TransferDetail);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al confirmar');
    }
    setActionLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm('Cancelar esta transferencia?')) return;
    setActionLoading(true);
    try {
      const api = getApiClient();
      await api.cancelStockTransfer(params.id);
      const updated = await api.getStockTransfer(params.id);
      setTransfer(updated as unknown as TransferDetail);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/transfers" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <p className="text-sm text-slate-500">Transferencia no encontrada</p>
        </div>
      </div>
    );
  }

  const st = statusConfig[transfer.status] || statusConfig.draft;
  const canConfirm = transfer.status === 'draft' || transfer.status === 'pending';
  const canCancel = transfer.status === 'draft' || transfer.status === 'pending';
  const totalCost = transfer.items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unit_cost)), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/dashboard/transfers" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{transfer.transfer_number}</h1>
            <Badge variant={st.variant}>{st.label}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {new Date(transfer.created_at).toLocaleDateString('es-CL')} {new Date(transfer.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {canConfirm && (
            <Button onClick={handleConfirm} disabled={actionLoading} className="flex-1 sm:flex-none justify-center bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              {actionLoading ? 'Procesando...' : 'Confirmar'}
            </Button>
          )}
          {canCancel && (
            <Button onClick={handleCancel} disabled={actionLoading} variant="secondary" className="flex-1 sm:flex-none justify-center text-rose-600 hover:bg-rose-50">
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Origen</p>
              <p className="text-sm font-bold text-slate-900">{transfer.source_warehouse?.name}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex items-center justify-center">
          <ArrowRight className="w-8 h-8 text-slate-300" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Destino</p>
              <p className="text-sm font-bold text-slate-900">{transfer.destination_warehouse?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-left px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="text-right px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                  <th className="text-right px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo Unit.</th>
                  <th className="text-right px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {transfer.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-xs font-medium text-slate-900">{item.product?.name}</td>
                    <td className="px-6 py-3 text-xs font-mono text-slate-500">{item.product?.sku}</td>
                    <td className="px-6 py-3 text-right text-xs font-bold text-slate-900">{Number(item.quantity)}</td>
                    <td className="px-6 py-3 text-right text-xs text-slate-500">
                      {Number(item.unit_cost) > 0 ? `$${Number(item.unit_cost).toLocaleString('es-CL')}` : '—'}
                    </td>
                    <td className="px-6 py-3 text-right text-xs font-medium text-slate-900">
                      {Number(item.unit_cost) > 0 ? `$${(Number(item.quantity) * Number(item.unit_cost)).toLocaleString('es-CL')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {transfer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{transfer.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
