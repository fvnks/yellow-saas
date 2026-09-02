'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Car,
  Wrench,
  Settings as SettingsIcon,
  ClipboardList,
} from 'lucide-react';

const clpFmt = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

interface OrderItem {
  id: string;
  item_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  subtotal: number;
  sort_order: number;
}

const ITEM_TYPES = [
  { value: 'labor', label: 'Mano de Obra' },
  { value: 'part', label: 'Repuesto' },
  { value: 'service', label: 'Servicio' },
  { value: 'product', label: 'Producto' },
  { value: 'fee', label: 'Cargo' },
];

function computeItemSubtotal(item: { quantity: number; unit_price: number; discount_pct: number }): number {
  const gross = item.quantity * item.unit_price;
  const discount = gross * ((item.discount_pct || 0) / 100);
  return Math.round(gross - discount);
}

export default function EditarOrdenPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [bays, setBays] = useState<any[]>([]);

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  const [formData, setFormData] = useState({
    vehicle_id: '',
    technician_id: '',
    bay_id: '',
    priority: 'normal',
    status: 'checkin',
    customer_complaint: '',
    diagnosis: '',
    notes: '',
  });

  const [newItem, setNewItem] = useState({
    item_type: 'labor',
    description: '',
    quantity: 1,
    unit_price: 0,
    discount_pct: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const fetches = Promise.all([
          fetch(`/api/auto-talleres/orders/${params.id}?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}`),
          fetch('/api/auto-talleres/vehicles?company_id=' + process.env.NEXT_PUBLIC_COMPANY_ID),
          fetch('/api/auto-talleres/technicians?company_id=' + process.env.NEXT_PUBLIC_COMPANY_ID),
          fetch('/api/auto-talleres/bays?company_id=' + process.env.NEXT_PUBLIC_COMPANY_ID),
          fetch(`/api/auto-talleres/orders/${params.id}/items?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}`),
        ]);

        const [orderRes, vehiclesRes, techRes, baysRes, itemsRes] = await fetches;

        if (!orderRes.ok) throw new Error(`HTTP ${orderRes.status}`);
        if (!itemsRes.ok) throw new Error(`HTTP ${itemsRes.status}`);

        const [orderData, vehiclesData, techData, baysData, itemsData] = await Promise.all([
          orderRes.json(),
          vehiclesRes.json(),
          techRes.json(),
          baysRes.json(),
          itemsRes.json(),
        ]);

        if (!orderData.success) throw new Error(orderData.error?.message || 'Error loading order');
        const o = orderData.data;
        setOrder(o);
        setFormData({
          vehicle_id: o.vehicle_id || '',
          technician_id: o.service_writer_id || '',
          bay_id: o.bay_id || '',
          priority: o.priority || 'normal',
          status: o.status || 'checkin',
          customer_complaint: o.customer_complaint || '',
          diagnosis: o.diagnosis || '',
          notes: o.notes || '',
        });
        if (vehiclesData.success) setVehicles(vehiclesData.data);
        if (techData.success) setTechnicians(techData.data);
        if (baysData.success) setBays(baysData.data);
        if (itemsData.success) setItems(itemsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading order');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/auto-talleres/orders/${params.id}?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service_writer_id: formData.technician_id || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Error updating order');
      router.push(`/auto-talleres/ordenes/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.description.trim()) {
      setError('Ingresa una descripción para el ítem');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const subtotal = computeItemSubtotal({
        quantity: Number(newItem.quantity),
        unit_price: Number(newItem.unit_price),
        discount_pct: Number(newItem.discount_pct),
      });
      const res = await fetch(`/api/auto-talleres/orders/${params.id}/items?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: process.env.NEXT_PUBLIC_COMPANY_ID,
          work_order_id: params.id,
          item_type: newItem.item_type,
          description: newItem.description,
          quantity: Number(newItem.quantity),
          unit_price: Number(newItem.unit_price),
          discount_pct: Number(newItem.discount_pct),
          subtotal,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Error adding item');
      const itemsRes = await fetch(`/api/auto-talleres/orders/${params.id}/items?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}`);
      if (!itemsRes.ok) throw new Error(`HTTP ${itemsRes.status}`);
      const itemsData = await itemsRes.json();
      if (itemsData.success) setItems(itemsData.data);
      setNewItem({ item_type: 'labor', description: '', quantity: 1, unit_price: 0, discount_pct: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/auto-talleres/orders/${params.id}/items/${itemId}?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Error deleting item');
      const itemsRes = await fetch(`/api/auto-talleres/orders/${params.id}/items?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}`);
      if (!itemsRes.ok) throw new Error(`HTTP ${itemsRes.status}`);
      const itemsData = await itemsRes.json();
      if (itemsData.success) setItems(itemsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const itemsSubtotal = items.reduce((sum, it) => sum + Number(it.subtotal || 0), 0);
  const iva = Math.round(itemsSubtotal * 0.19);
  const total = itemsSubtotal + iva;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/auto-talleres/ordenes/${params.id}`}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">Editar Orden</h1>
          <p className="text-sm text-slate-500 mt-1">{order?.order_number} — Actualiza la orden y sus ítems</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order data */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-500" />
              Datos de la Orden
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vehículo *</label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => handleChange('vehicle_id', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                  required
                >
                  <option value="">Seleccionar vehículo...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} - {v.brand} {v.model} ({v.year})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prioridad *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Técnico Asignado</label>
                <select
                  value={formData.technician_id}
                  onChange={(e) => handleChange('technician_id', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="">Sin asignar</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} - {t.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bay / Puesto</label>
                <select
                  value={formData.bay_id}
                  onChange={(e) => handleChange('bay_id', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="">Sin asignar</option>
                  {bays.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name || `Bay ${b.number}`} ({b.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Motivo de la Visita / Queja del Cliente</label>
              <textarea
                value={formData.customer_complaint}
                onChange={(e) => handleChange('customer_complaint', e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Diagnóstico</label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => handleChange('diagnosis', e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notas Internas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Items management */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-orange-500" />
              Ítems de la Orden ({items.length})
            </h2>
          </div>

          <div className="p-6">
            {/* Items list */}
            {items.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50/50 rounded-xl mb-6">
                <ClipboardList className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm">Sin ítems agregados. Agrega mano de obra o repuestos.</p>
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700 capitalize flex-shrink-0">
                      {item.item_type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.description}</p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} x {clpFmt.format(item.unit_price)}
                        {item.discount_pct > 0 ? ` (${item.discount_pct}% dto)` : ''}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 flex-shrink-0">{clpFmt.format(item.subtotal)}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={saving}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors flex-shrink-0"
                      title="Eliminar ítem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add item */}
            <div className="border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/30">
              <p className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-500" /> Agregar ítem
              </p>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
                <select
                  value={newItem.item_type}
                  onChange={(e) => setNewItem(prev => ({ ...prev, item_type: e.target.value }))}
                  className="px-3 py-2 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  {ITEM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <input
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción"
                  className="col-span-2 md:col-span-2 px-3 py-2 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <input
                  type="number"
                  value={newItem.quantity}
                  min="1"
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Math.max(1, Number(e.target.value) || 1) }))}
                  placeholder="Cant."
                  className="px-3 py-2 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <input
                  type="number"
                  value={newItem.unit_price}
                  min="0"
                  onChange={(e) => setNewItem(prev => ({ ...prev, unit_price: Math.max(0, Number(e.target.value) || 0) }))}
                  placeholder="Precio unitario"
                  className="px-3 py-2 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={saving}
                className="mt-3 inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-xl text-sm transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                {saving ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Car className="w-4 h-4 text-orange-500" />
              Totales
            </h2>
          </div>
          <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subtotal</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{clpFmt.format(itemsSubtotal)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">IVA (19%)</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{clpFmt.format(iva)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</p>
              <p className="text-lg font-black text-orange-600 mt-1">{clpFmt.format(total)}</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/auto-talleres/ordenes/${params.id}`}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || !formData.vehicle_id}
            className="bg-[#FACC15] hover:bg-[#EAB308] disabled:bg-slate-300 disabled:cursor-not-allowed text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
