'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Settings,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import { getStatusBadgeClass, getStatusLabel } from '../lib/utils';

const bays = [
  { id: 'b1', bay_number: 1, type: 'general', status: 'available', max_weight: 3000, equipment: 'Elevador' },
  { id: 'b2', bay_number: 2, type: 'elevador', status: 'occupied', max_weight: 5000, equipment: 'Elevador 2 Postos' },
  { id: 'b3', bay_number: 3, type: 'general', status: 'occupied', max_weight: 3000, equipment: 'Ninguno' },
  { id: 'b4', bay_number: 4, type: 'alineacion', status: 'occupied', max_weight: 3500, equipment: 'Alineadora 3D' },
  { id: 'b5', bay_number: 5, type: 'express', status: 'available', max_weight: 2000, equipment: 'Ninguno' },
];

export default function BaysPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredBays = bays.filter((bay) => {
    const matchesType = !selectedType || bay.type === selectedType;
    const matchesSearch = bay.bay_number.toString().includes(search) ||
      bay.type.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">Bays del Taller</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona los puestos de trabajo</p>
        </div>
        <button className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Nuevo Bay
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Disponibles</p>
              <p className="text-2xl font-black text-[#0F172A]">{bays.filter(b => b.status === 'available').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ocupados</p>
              <p className="text-2xl font-black text-[#0F172A]">{bays.filter(b => b.status === 'occupied').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Settings className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-black text-[#0F172A]">{bays.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedType === null ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          {['general', 'elevador', 'alineacion', 'express'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type === selectedType ? null : type)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                selectedType === type ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Bays Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredBays.map((bay) => (
          <div
            key={bay.id}
            className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Wrench className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-lg font-black text-[#0F172A]">Bay {bay.bay_number}</p>
                  <p className="text-xs text-slate-500 capitalize">{bay.type}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(bay.status)}`}>
                {getStatusLabel(bay.status)}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Peso Máximo</span>
                <span className="font-semibold text-slate-900">{bay.max_weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Equipamiento</span>
                <span className="font-semibold text-slate-900">{bay.equipment}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link
                href={`/auto-talleres/bays/${bay.id}`}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                Ver detalles
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
