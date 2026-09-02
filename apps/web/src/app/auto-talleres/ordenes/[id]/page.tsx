'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Share2,
  Save,
  Plus,
  Wrench,
  Car,
  User,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { formatCLP, formatDate, getStatusBadgeClass, getStatusLabel } from '../../lib/utils';

interface OrderItem {
  id: string;
  item_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  subtotal: number;
  iva_amount: number;
  total: number;
  checkin_date: string;
  estimated_completion_date: string;
  actual_completion_date: string;
  customer_complaint: string;
  diagnosis: string;
  notes: string;
  auto_vehicles?: {
    patente: string;
    brand: string;
    model: string;
    year: number;
    color: string;
  };
  customers?: {
    nombre: string;
    rut: string;
    email: string;
    telefono: string;
  };
  auto_technicians?: {
    full_name: string;
    specialization: string;
  };
}

export default function OrdenDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const statusFlow: Record<string, string[]> = {
    checkin: ['diagnostic'],
    diagnostic: ['estimated', 'waiting_parts'],
    estimated: ['approved', 'cancelled'],
    approved: ['in_progress'],
    waiting_parts: ['in_progress'],
    in_progress: ['quality_check'],
    quality_check: ['ready'],
    ready: ['delivered'],
    delivered: ['invoiced'],
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [orderRes, itemsRes] = await Promise.all([
          fetch(`/api/auto-talleres/orders/${params.id}?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}`),
          fetch(`/api/auto-talleres/orders/${params.id}/items?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}`),
        ]);

        const orderData = await orderRes.json();
        const itemsData = await itemsRes.json();

        if (orderData.success) setOrder(orderData.data);
        if (itemsData.success) setItems(itemsData.data);
      } catch (err) {
        setError('Error loading order data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  const nextStatuses = order ? (statusFlow[order.status] || []) : [];

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/auto-talleres/orders/${params.id}?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
        <p className="text-slate-500 mb-4">{error || 'Orden no encontrada'}</p>
        <Link href="/auto-talleres/ordenes" className="text-orange-600 font-semibold hover:underline">
          Volver a Órdenes
        </Link>
      </div>
    );
  }

  const vehicle = order.auto_vehicles;
  const client = order.customers;
  const technician = order.auto_technicians;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/auto-talleres/ordenes"
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-[#0F172A]">{order.order_number}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                order.priority === 'urgente' ? 'bg-rose-100 text-rose-700' :
                order.priority === 'alta' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {order.priority.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Creada el {formatDate(order.checkin_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Status Transition Buttons */}
      {order && nextStatuses.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Cambiar Estado
          </p>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
              >
                <ArrowRight className="w-3 h-3" />
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle & Client Info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center gap-2">
              <Car className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold text-slate-900">Vehículo y Cliente</h2>
            </div>
            <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehículo</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {vehicle?.brand} {vehicle?.model}
                </p>
                <p className="text-sm text-slate-500">{vehicle?.patente} · {vehicle?.year}</p>
                <p className="text-sm text-slate-500">{vehicle?.color}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{client?.nombre}</p>
                <p className="text-sm text-slate-500">{client?.rut}</p>
                <p className="text-sm text-slate-500">{client?.telefono}</p>
                <p className="text-sm text-slate-500">{client?.email}</p>
              </div>
            </div>
          </div>

          {/* Complaint & Diagnosis */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold text-slate-900">Diagnóstico</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Queja del Cliente</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl">{order.customer_complaint || 'Sin descripción'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Diagnóstico</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl">{order.diagnosis || 'Pendiente'}</p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Notas Internas</p>
                  <p className="text-sm text-slate-700 bg-amber-50 border border-amber-200 p-3 rounded-xl">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Work Order Items */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold text-slate-900">Items de la Orden</h2>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 text-sm font-semibold hover:bg-orange-500/20 transition-colors">
                <Plus className="w-4 h-4" />
                Agregar Item
              </button>
            </div>
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200/80">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3">Tipo</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3">Descripción</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3">Cant.</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3">Precio</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500">
                        No hay items registrados. Agrega mano de obra o repuestos.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.item_type === 'labor' ? 'bg-blue-100 text-blue-700' :
                            item.item_type === 'part' ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {item.item_type === 'labor' ? 'Mano de Obra' :
                             item.item_type === 'part' ? 'Repuesto' : 'Servicio'}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-slate-700">{item.description}</td>
                        <td className="py-3 text-sm text-right font-semibold text-slate-900">{item.quantity}</td>
                        <td className="py-3 text-sm text-right text-slate-600">{formatCLP(item.unit_price)}</td>
                        <td className="py-3 text-sm text-right font-bold text-slate-900">{formatCLP(item.subtotal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80">
              <h2 className="text-sm font-bold text-slate-900">Resumen Financial</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCLP(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">IVA (19%)</span>
                <span className="font-semibold text-slate-900">{formatCLP(order.iva_amount)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-xl font-black text-orange-600">{formatCLP(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80">
              <h2 className="text-sm font-bold text-slate-900">Timeline</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Check-in</p>
                  <p className="text-xs text-slate-500">{formatDate(order.checkin_date)}</p>
                </div>
              </div>
              {order.estimated_completion_date && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Entrega Estimada</p>
                    <p className="text-xs text-slate-500">{formatDate(order.estimated_completion_date)}</p>
                  </div>
                </div>
              )}
              {order.actual_completion_date && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Completada</p>
                    <p className="text-xs text-slate-500">{formatDate(order.actual_completion_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80">
              <h2 className="text-sm font-bold text-slate-900">Asignaciones</h2>
            </div>
            <div className="p-6 space-y-4">
              {technician ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <User className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{technician.full_name}</p>
                    <p className="text-xs text-slate-500">{technician.specialization}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Sin técnico asignado</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
