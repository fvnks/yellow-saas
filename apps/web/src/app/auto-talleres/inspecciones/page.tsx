'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  ShieldCheck,
  ArrowUpRight,
  Camera,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatCLP, formatDate, getStatusBadgeClass, getStatusLabel } from '../lib/utils';

const inspections = [
  {
    id: 'INS-001',
    work_order_id: 'OT-2024-001',
    vehicle: 'Toyota Corolla 2022',
    plate: 'ABCD12',
    client: 'Juan Pérez',
    type: 'check_in',
    status: 'finalized',
    mileage: 45200,
    fuel_level: '3/4',
    lights_working: true,
    wipers_working: true,
    ac_working: true,
    dashboard_warnings: false,
    exterior_condition: 'Buen estado general',
    interior_condition: 'Limpio',
    tire_condition: 'Neumáticos en 70%',
    damage_notes: 'Rayón menor en parachoques trasero',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'INS-002',
    work_order_id: 'OT-2024-002',
    vehicle: 'Chevrolet Spark 2020',
    plate: 'EFGH34',
    client: 'María González',
    type: 'pre_repair',
    status: 'draft',
    mileage: 62100,
    fuel_level: '1/2',
    lights_working: true,
    wipers_working: false,
    ac_working: false,
    dashboard_warnings: true,
    exterior_condition: 'Con rayones laterales',
    interior_condition: 'Algunas manchas',
    tire_condition: 'Desgaste irregular',
    damage_notes: 'Luz dashboard encendida',
    created_at: '2024-01-14T14:00:00Z',
  },
];

export default function InspeccionesPage() {
  const [search, setSearch] = useState('');

  const filteredInspections = inspections.filter((insp) => {
    const searchLower = search.toLowerCase();
    return (
      insp.id.toLowerCase().includes(searchLower) ||
      insp.vehicle.toLowerCase().includes(searchLower) ||
      insp.client.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">Inspecciones</h1>
          <p className="text-sm text-slate-500 mt-1">Registro visual y estado de vehículos</p>
        </div>
        <button className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Nueva Inspección
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Camera className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-black text-[#0F172A]">{inspections.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Finalizadas</p>
              <p className="text-2xl font-black text-[#0F172A]">{inspections.filter(i => i.status === 'finalized').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Con Daños</p>
              <p className="text-2xl font-black text-[#0F172A]">{inspections.filter(i => i.damage_notes).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <XCircle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Alertas</p>
              <p className="text-2xl font-black text-[#0F172A]">{inspections.filter(i => i.dashboard_warnings).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar inspección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Inspections List */}
      <div className="space-y-4">
        {filteredInspections.map((insp) => (
          <div
            key={insp.id}
            className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <ShieldCheck className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-[#0F172A]">{insp.id}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(insp.status)}`}>
                      {insp.status === 'finalized' ? 'Finalizada' : 'Borrador'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{insp.vehicle} · {insp.plate}</p>
                </div>
              </div>
              <Link
                href={`/auto-talleres/inspecciones/${insp.id}`}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Cliente</p>
                <p className="font-semibold text-slate-900">{insp.client}</p>
              </div>
              <div>
                <p className="text-slate-500">Kilometraje</p>
                <p className="font-semibold text-slate-900">{insp.mileage.toLocaleString('es-CL')} km</p>
              </div>
              <div>
                <p className="text-slate-500">Nivel de Combustible</p>
                <p className="font-semibold text-slate-900">{insp.fuel_level}</p>
              </div>
              <div>
                <p className="text-slate-500">Fecha</p>
                <p className="font-semibold text-slate-900">{formatDate(insp.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
              <span className={`flex items-center gap-1 ${insp.lights_working ? 'text-emerald-600' : 'text-rose-600'}`}>
                {insp.lights_working ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                Luces
              </span>
              <span className={`flex items-center gap-1 ${insp.wipers_working ? 'text-emerald-600' : 'text-rose-600'}`}>
                {insp.wipers_working ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                Limpiaparabrisas
              </span>
              <span className={`flex items-center gap-1 ${insp.ac_working ? 'text-emerald-600' : 'text-rose-600'}`}>
                {insp.ac_working ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                A/C
              </span>
              <span className={`flex items-center gap-1 ${!insp.dashboard_warnings ? 'text-emerald-600' : 'text-rose-600'}`}>
                {!insp.dashboard_warnings ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                Dashboard
              </span>
              {insp.damage_notes && (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Daños registrados
                </span>
              )}
            </div>

            {insp.damage_notes && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 mb-1">Notas de Daños</p>
                <p className="text-sm text-amber-800">{insp.damage_notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
