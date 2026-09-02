'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Car,
  User,
  Wrench,
  Settings as SettingsIcon,
  AlertCircle,
} from 'lucide-react';

export default function NuevaOrdenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [bays, setBays] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    vehicle_id: '',
    client_id: '',
    technician_id: '',
    bay_id: '',
    priority: 'normal',
    status: 'checkin',
    customer_complaint: '',
    notes: '',
    subtotal: 0,
    iva: 0,
    total: 0,
  });

  useEffect(() => {
    async function loadSelectData() {
      try {
        const [vehiclesRes, techniciansRes, baysRes] = await Promise.all([
          fetch('/api/auto-talleres/vehicles?company_id=' + process.env.NEXT_PUBLIC_COMPANY_ID),
          fetch('/api/auto-talleres/technicians?company_id=' + process.env.NEXT_PUBLIC_COMPANY_ID),
          fetch('/api/auto-talleres/bays?company_id=' + process.env.NEXT_PUBLIC_COMPANY_ID),
        ]);

        const vehiclesData = await vehiclesRes.json();
        const techniciansData = await techniciansRes.json();
        const baysData = await baysRes.json();

        if (vehiclesData.success) setVehicles(vehiclesData.data);
        if (techniciansData.success) setTechnicians(techniciansData.data);
        if (baysData.success) setBays(baysData.data.filter((b: any) => b.status === 'available'));
      } catch (err) {
        console.error('Error loading form data:', err);
      }
    }
    loadSelectData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auto-talleres/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, company_id: process.env.NEXT_PUBLIC_COMPANY_ID }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Error creating order');

      router.push(`/auto-talleres/ordenes/${data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'subtotal') {
        const iva = Number(value) * 0.19;
        next.iva = Math.round(iva);
        next.total = Number(value) + iva;
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/auto-talleres/ordenes"
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">Nueva Orden de Trabajo</h1>
          <p className="text-sm text-slate-500 mt-1">Complete los datos para registrar una nueva orden</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-4 h-4 text-orange-500" />
            Datos del Vehículo y Cliente
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Vehículo *
              </label>
              <select
                value={formData.vehicle_id}
                onChange={(e) => handleChange('vehicle_id', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                required
              >
                <option value="">Seleccionar vehículo...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.patente} - {v.brand} {v.model} ({v.year})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Prioridad *
              </label>
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

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Motivo de la Visita / Queja del Cliente
            </label>
            <textarea
              value={formData.customer_complaint}
              onChange={(e) => handleChange('customer_complaint', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
              placeholder="Describa el problema reportado por el cliente..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-500" />
            Asignación de Taller
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Técnico Asignado
              </label>
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Bay / Posto
              </label>
              <select
                value={formData.bay_id}
                onChange={(e) => handleChange('bay_id', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="">Sin asignar</option>
                {bays.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bay {b.number} ({b.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Notas Internas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
              placeholder="Notas internas para el equipo..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-orange-500" />
            Valores (se calculará IVA 19%)
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subtotal</label>
              <input
                type="number"
                value={formData.subtotal}
                onChange={(e) => handleChange('subtotal', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">IVA (19%)</label>
              <input
                type="text"
                value={new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(formData.iva)}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm bg-slate-50 text-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total</label>
              <input
                type="text"
                value={new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(formData.total)}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm bg-slate-50 font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200/80 flex items-center justify-end gap-3 bg-slate-50/50">
          <Link
            href="/auto-talleres/ordenes"
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
            {loading ? 'Guardando...' : 'Guardar Orden'}
          </button>
        </div>
      </form>
    </div>
  );
}
