'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { formatCLP, formatDate, getStatusBadgeClass, getStatusLabel } from '../lib/utils';

const estimates = [
  {
    id: 'EST-001',
    order_id: 'OT-2024-001',
    client: 'Juan Pérez',
    vehicle: 'Toyota Corolla 2022',
    status: 'approved',
    subtotal: 350000,
    iva: 73500,
    total: 423500,
    created_at: '2024-01-14T10:00:00Z',
    valid_until: '2024-01-28T10:00:00Z',
  },
  {
    id: 'EST-002',
    order_id: 'OT-2024-002',
    client: 'María González',
    vehicle: 'Chevrolet Spark 2020',
    status: 'pending',
    subtotal: 150000,
    iva: 31500,
    total: 181500,
    created_at: '2024-01-15T09:00:00Z',
    valid_until: '2024-01-29T09:00:00Z',
  },
  {
    id: 'EST-003',
    order_id: 'OT-2024-003',
    client: 'Roberto Díaz',
    vehicle: 'Ford Ranger 2021',
    status: 'expired',
    subtotal: 680000,
    iva: 142800,
    total: 822800,
    created_at: '2024-01-10T14:00:00Z',
    valid_until: '2024-01-24T14:00:00Z',
  },
];

export default function EstimadosPage() {
  const [search, setSearch] = useState('');

  const filteredEstimates = estimates.filter((estimate) => {
    const searchLower = search.toLowerCase();
    return (
      estimate.id.toLowerCase().includes(searchLower) ||
      estimate.client.toLowerCase().includes(searchLower) ||
      estimate.vehicle.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">Estimados</h1>
          <p className="text-sm text-slate-500 mt-1">Presupuestos y cotizaciones para clientes</p>
        </div>
        <button className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Nuevo Estimado
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Estimados</p>
              <p className="text-2xl font-black text-[#0F172A]">{estimates.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Aprobados</p>
              <p className="text-2xl font-black text-[#0F172A]">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pendientes</p>
              <p className="text-2xl font-black text-[#0F172A]">1</p>
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
            placeholder="Buscar estimado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Estimates List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Estimado
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Orden
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Cliente
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Vehículo
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Estado
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Total
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Válido Hasta
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredEstimates.map((estimate) => (
                <tr
                  key={estimate.id}
                  className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{estimate.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{estimate.order_id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">{estimate.client}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{estimate.vehicle}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(estimate.status)}`}>
                      {getStatusLabel(estimate.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{formatCLP(estimate.total)}</p>
                    <p className="text-xs text-slate-500">
                      {formatCLP(estimate.subtotal)} + IVA {formatCLP(estimate.iva)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-500">{formatDate(estimate.valid_until)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/auto-talleres/estimados/${estimate.id}`}
                      className="p-2 hover:bg-slate-200/50 rounded-lg transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
