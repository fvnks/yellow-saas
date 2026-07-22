'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { User, ShoppingCart, FileText, AlertCircle, Package } from 'lucide-react';

interface PortalData {
  customer: {
    name: string;
    trade_name: string;
    tax_id: string;
    email: string;
  };
  orders: {
    order_number: string;
    status: string;
    total: number;
    created_at: string;
    items_summary: string[];
  }[];
  invoices: {
    invoice_number: string;
    status: string;
    total: number;
    created_at: string;
  }[];
}

const orderStatusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const invoiceStatusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  issued: 'bg-blue-100 text-blue-700',
  sent: 'bg-indigo-100 text-indigo-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
};

const orderStatusLabel: Record<string, string> = {
  draft: 'Borrador',
  confirmed: 'Confirmada',
  processing: 'Procesando',
  shipped: 'Enviada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
};

const invoiceStatusLabel: Record<string, string> = {
  draft: 'Borrador',
  issued: 'Emitida',
  sent: 'Enviada',
  paid: 'Pagada',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
};

export default function CustomerPortalPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/portal/customer/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => { setError('Error al cargar portal'); setLoading(false); });
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto mb-4" />
        <div className="h-4 bg-slate-200 rounded w-48 mx-auto" />
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900">Portal no encontrado</h1>
        <p className="text-sm text-slate-500 mt-2">{error || 'No se pudo cargar la información'}</p>
      </div>
    </div>
  );

  const { customer, orders, invoices } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
              {customer.trade_name && <p className="text-sm text-slate-500 mt-1">{customer.trade_name}</p>}
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                {customer.tax_id && <span>RUT: {customer.tax_id}</span>}
                {customer.email && <span>{customer.email}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-900">Órdenes de Venta</h2>
          </div>
          {orders.length === 0 ? (
            <p className="text-xs text-slate-500">No hay órdenes registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nº Orden</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Artículos</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-slate-900">{order.order_number}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${orderStatusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                          {orderStatusLabel[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {order.items_summary.length > 0 ? order.items_summary.join(', ') : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-900 text-right font-medium">
                        ${Number(order.total || 0).toLocaleString('es-CL')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 text-right">
                        {new Date(order.created_at).toLocaleDateString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-900">Facturas</h2>
          </div>
          {invoices.length === 0 ? (
            <p className="text-xs text-slate-500">No hay facturas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nº Factura</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-slate-900">{inv.invoice_number}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${invoiceStatusColors[inv.status] || 'bg-slate-100 text-slate-700'}`}>
                          {invoiceStatusLabel[inv.status] || inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-900 text-right font-medium">
                        ${Number(inv.total || 0).toLocaleString('es-CL')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 text-right">
                        {new Date(inv.created_at).toLocaleDateString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center text-[10px] text-slate-400 mt-8">
          Portal generado por Yellow ERP
        </div>
      </div>
    </div>
  );
}
