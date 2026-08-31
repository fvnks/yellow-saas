'use client';

import { useState, useEffect } from 'react';
import { Gauge, Plus, Flame, Droplet, Zap, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCLP } from '@/lib/condominio-client';

interface MeterReading {
  id: string;
  unitId: string;
  unitNumber: string;
  meterType: 'agua_caliente' | 'gas' | 'calefaccion';
  meterNumber: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  unitRateCLP: number;
  totalCLP: number;
}

export default function MedidoresPage() {
  const [meters, setMeters] = useState<MeterReading[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReadingModal, setShowAddReadingModal] = useState(false);

  // Form states
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [meterType, setMeterType] = useState<'agua_caliente' | 'gas' | 'calefaccion'>('agua_caliente');
  const [previousReading, setPreviousReading] = useState('100');
  const [currentReading, setCurrentReading] = useState('125');
  const [rateCLP, setRateCLP] = useState('3500');

  const fetchMeters = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/condominio/meters');
      const json = await res.json();
      if (json.success) setMeters(json.data || []);

      const uRes = await fetch('/api/condominio');
      const uJson = await uRes.json();
      if (uJson.success && uJson.data.units) {
        setUnits(uJson.data.units);
        if (uJson.data.units.length > 0 && !selectedUnitId) setSelectedUnitId(uJson.data.units[0].id);
      }
    } catch (err) {
      console.error('Error fetching meters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  const handleAddReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId) return;

    try {
      const res = await fetch('/api/condominio/meters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: selectedUnitId,
          meter_type: meterType,
          previous_reading: parseFloat(previousReading) || 0,
          current_reading: parseFloat(currentReading) || 0,
          unit_rate_clp: parseFloat(rateCLP) || 3500
        })
      });
      const json = await res.json();
      if (json.success) {
        await fetchMeters();
        setShowAddReadingModal(false);
      } else {
        alert(json.error || 'Error al registrar lectura');
      }
    } catch (err) {
      console.error('Error adding meter reading:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Lectura de Submedidores Individuales
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Agua Caliente & Gas
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Cobro de consumos individuales de remarcadores por departamento incorporados en el gasto común.
          </p>
        </div>

        <button
          onClick={() => setShowAddReadingModal(true)}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nueva Lectura
        </button>
      </div>

      {/* Meter Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-600" />
            Registro de Lecturas
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-6 py-3">Unidad</th>
                <th className="px-6 py-3">Servicio</th>
                <th className="px-6 py-3">Lectura Anterior</th>
                <th className="px-6 py-3">Lectura Actual</th>
                <th className="px-6 py-3">Consumo</th>
                <th className="px-6 py-3">Tarifa m³ / Un</th>
                <th className="px-6 py-3 text-right">Total CLP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No hay lecturas registradas en este período.
                  </td>
                </tr>
              ) : (
                meters.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">Depto {m.unitNumber}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        {m.meterType === 'agua_caliente' && <Droplet className="w-3.5 h-3.5 text-blue-500" />}
                        {m.meterType === 'gas' && <Flame className="w-3.5 h-3.5 text-amber-500" />}
                        {m.meterType === 'calefaccion' && <Zap className="w-3.5 h-3.5 text-rose-500" />}
                        {m.meterType.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{m.previousReading} m³</td>
                    <td className="px-6 py-3.5 text-slate-900 font-semibold">{m.currentReading} m³</td>
                    <td className="px-6 py-3.5 font-bold text-emerald-700">{m.consumption} m³</td>
                    <td className="px-6 py-3.5 text-slate-600">{formatCLP(m.unitRateCLP)}</td>
                    <td className="px-6 py-3.5 text-right font-black text-slate-900">{formatCLP(m.totalCLP)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Reading */}
      {showAddReadingModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Registrar Lectura de Medidor</h3>
            <form onSubmit={handleAddReading} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unidad</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unidad {u.number} - {u.ownerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Servicio</label>
                <select
                  value={meterType}
                  onChange={(e) => setMeterType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="agua_caliente">Agua Caliente</option>
                  <option value="gas">Gas de Cañería</option>
                  <option value="calefaccion">Calefacción</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lectura Anterior</label>
                  <input
                    type="number"
                    step="0.01"
                    value={previousReading}
                    onChange={(e) => setPreviousReading(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lectura Actual</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentReading}
                    onChange={(e) => setCurrentReading(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tarifa CLP por m³ / Unidad</label>
                <input
                  type="number"
                  value={rateCLP}
                  onChange={(e) => setRateCLP(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReadingModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs"
                >
                  Guardar Lectura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
