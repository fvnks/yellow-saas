'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Minus,
  Car,
  User,
  Wrench,
  Package,
  AlertCircle,
  Trash2,
} from 'lucide-react';

const clpFmt = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
}

interface EstimateItem {
  id: string;
  item_type: 'labor' | 'part' | 'service' | 'fee';
  description: string;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  subtotal: number;
}

export default function NuevoEstimadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    vehicle_id: '',
    client_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    valid_until: '',
    client_notes: '',
    shop_terms: '',
  });

  const [items, setItems] = useState<EstimateItem[]>([
    { id: '1', item_type: 'labor', description: '', quantity: 1, unit_price: 0, discount_pct: 0, subtotal: 0 },
  ]);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await fetch('/api/auto-talleres/vehicles?company_id=' + process.env.NEXT_PUBLIC_COMPANY_ID);
        const data = await res.json();
        if (data.success) setVehicles(data.data);
      } catch (err) {
        console.error('Error loading vehicles:', err);
      }
    }
    loadVehicles();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = subtotal * 0.1;
  const iva = (subtotal - discount) * 0.19;
  const total = subtotal - discount + iva;

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      item_type: 'labor',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_pct: 0,
      subtotal: 0,
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof EstimateItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.subtotal = updated.quantity * updated.unit_price * (1 - updated.discount_pct / 100);
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auto-talleres/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items,
          subtotal,
          iva,
          total,
          company_id: process.env.NEXT_PUBLIC_COMPANY_ID,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Error creating estimate');

      router.push('/auto-talleres/estimados');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/auto-talleres/estimados"
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">Nuevo Estimado</h1>
          <p className="text-sm text-slate-500 mt-1">Crea un presupuesto para el cliente</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle & Client */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center gap-2">
            <Car className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-slate-900">Vehículo y Fecha</h2>
          </div>
          <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vehículo *</label>
              <select
                value={formData.vehicle_id}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicle_id: e.target.value }))}
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha Emisión</label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Válido Hasta</label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold text-slate-900">Items del Estimado</h2>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 text-sm font-semibold hover:bg-orange-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Item
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                    <select
                      value={item.item_type}
                      onChange={(e) => updateItem(item.id, 'item_type', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200/80 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="labor">Mano de Obra</option>
                      <option value="part">Repuesto</option>
                      <option value="service">Servicio</option>
                      <option value="fee">Arancel</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Descripción..."
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Cant."
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, Number(e.target.value) || 1))}
                        className="w-20 px-3 py-2 rounded-lg border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        min="1"
                      />
                      <input
                        type="number"
                        placeholder="Precio"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', Math.max(0, Number(e.target.value) || 0))}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        min="0"
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {clpFmt.format(item.subtotal)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 hover:bg-rose-100 rounded-lg transition-colors text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900">Resumen</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCLP(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Descuento (10%)</span>
              <span className="font-semibold text-rose-600">-{formatCLP(discount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">IVA (19%)</span>
              <span className="font-semibold text-slate-900">{formatCLP(iva)}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-orange-600">{formatCLP(total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/auto-talleres/estimados"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.vehicle_id}
            className="bg-[#FACC15] hover:bg-[#EAB308] disabled:bg-slate-300 disabled:cursor-not-allowed text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Estimado'}
          </button>
        </div>
      </form>
    </div>
  );
}

function formatCLP(val: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
}
