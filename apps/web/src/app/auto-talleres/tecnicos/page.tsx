'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Users,
  ArrowUpRight,
  Star,
  Wrench,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const technicians = [
  {
    id: 't1',
    nombre: 'Carlos Muñoz',
    rut: '12.345.678-9',
    especialidad: 'Mecánica General',
    telefono: '+56 9 1111 2222',
    email: 'carlos.munoz@taller.cl',
    horario: 'Lun-Vie 08:00-18:00',
    ordenes_activas: 3,
    tasa_rechazo: 2.1,
    rating: 4.8,
    disponibilidad: 'available',
  },
  {
    id: 't2',
    nombre: 'Pedro Silva',
    rut: '9.876.543-2',
    especialidad: 'Electricidad Automotriz',
    telefono: '+56 9 2222 3333',
    email: 'pedro.silva@taller.cl',
    horario: 'Lun-Vie 08:00-18:00',
    ordenes_activas: 2,
    tasa_rechazo: 1.5,
    rating: 4.6,
    disponibilidad: 'available',
  },
  {
    id: 't3',
    nombre: 'Ana Torres',
    rut: '11.222.333-4',
    especialidad: 'Frenos y Suspensión',
    telefono: '+56 9 3333 4444',
    email: 'ana.torres@taller.cl',
    horario: 'Lun-Vie 09:00-19:00',
    ordenes_activas: 1,
    tasa_rechazo: 0.8,
    rating: 4.9,
    disponibilidad: 'busy',
  },
];

export default function TecnicosPage() {
  const [search, setSearch] = useState('');

  const filteredTechnicians = technicians.filter((tech) => {
    const searchLower = search.toLowerCase();
    return (
      tech.nombre.toLowerCase().includes(searchLower) ||
      tech.especialidad.toLowerCase().includes(searchLower) ||
      tech.rut.includes(search)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">Técnicos</h1>
          <p className="text-sm text-slate-500 mt-1">{technicians.length} técnicos registrados</p>
        </div>
        <button className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Nuevo Técnico
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar técnico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredTechnicians.map((tech) => (
          <div
            key={tech.id}
            className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Users className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-[#0F172A]">{tech.nombre}</p>
                    <span className={`w-2 h-2 rounded-full ${
                      tech.disponibilidad === 'available' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                  </div>
                  <p className="text-xs text-slate-500">{tech.especialidad}</p>
                </div>
              </div>
              <Link
                href={`/auto-talleres/tecnicos/${tech.id}`}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">RUT</span>
                <span className="font-semibold text-slate-900">{tech.rut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teléfono</span>
                <span className="font-semibold text-slate-900">{tech.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Horario</span>
                <span className="font-semibold text-slate-900">{tech.horario}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-black text-[#0F172A]">{tech.ordenes_activas}</p>
                <p className="text-xs text-slate-500">Órdenes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-[#0F172A]">{tech.rating}</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-current" />
                  <span className="text-xs text-slate-500">Rating</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-[#0F172A]">{tech.tasa_rechazo}%</p>
                <p className="text-xs text-slate-500">Rechazo</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
