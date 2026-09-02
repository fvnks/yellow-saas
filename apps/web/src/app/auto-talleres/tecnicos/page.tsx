'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Users,
  ArrowUpRight,
  Wrench,
  Phone,
  Mail,
} from 'lucide-react';
import { formatCLP, getStatusBadgeClass, getStatusLabel } from '../lib/utils';

interface Technician {
  id: string;
  rut: string;
  full_name: string;
  phone: string;
  email: string;
  specialization: string;
  hourly_rate: number;
  status: string;
}

export default function TecnicosPage() {
  const [search, setSearch] = useState('');
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTechnicians() {
      try {
        const res = await fetch(`/api/auto-talleres/technicians?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) setTechnicians(data.data);
      } catch (err) {
        console.error('Error loading technicians:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTechnicians();
  }, []);

  const filteredTechnicians = technicians.filter((tech) => {
    const searchLower = search.toLowerCase();
    return (
      tech.full_name.toLowerCase().includes(searchLower) ||
      (tech.specialization || '').toLowerCase().includes(searchLower) ||
      (tech.rut || '').includes(search)
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
      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredTechnicians.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-white border border-slate-200/80 rounded-2xl">
          <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No hay técnicos registrados</p>
        </div>
      ) : (
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
                    <p className="text-lg font-black text-[#0F172A]">{tech.full_name}</p>
                    <p className="text-xs text-slate-500">{tech.specialization}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(tech.status)}`}>
                  {getStatusLabel(tech.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">RUT</span>
                  <span className="font-semibold text-slate-900">{tech.rut || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Teléfono</span>
                  <span className="font-semibold text-slate-900">{tech.phone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-900 truncate">{tech.email || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tarifa Hora</span>
                  <span className="font-semibold text-slate-900">{formatCLP(tech.hourly_rate)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link
                  href={`/auto-talleres/tecnicos/${tech.id}`}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  Ver detalles
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
