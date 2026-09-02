'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Filter,
  ArrowUpRight,
  MoreHorizontal,
  Wrench,
  Car,
  FileText,
  Calendar,
  Clock,
} from 'lucide-react';
import { formatCLP, formatDate, getStatusBadgeClass, getStatusLabel, getPriorityClass, getPriorityLabel } from '../lib/utils';
import { useAutoTalleresStore } from '../lib/auto-talleres-store';

const orders = [
  {
    id: 'OT-2024-001',
    vehicle: 'Toyota Corolla 2022',
    plate: 'ABCD12',
    client: 'Juan Pérez',
    status: 'in_progress',
    priority: 'alta',
    technician: 'Carlos Muñoz',
    bay: 'Bay 3',
    progress: 65,
    total: 450000,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 'OT-2024-002',
    vehicle: 'Chevrolet Spark 2020',
    plate: 'EFGH34',
    client: 'María González',
    status: 'diagnostic',
    priority: 'normal',
    technician: 'Pedro Silva',
    bay: 'Bay 1',
    progress: 30,
    total: 180000,
    created_at: '2024-01-15T09:15:00Z',
  },
  {
    id: 'OT-2024-003',
    vehicle: 'Ford Ranger 2021',
    plate: 'IJKL56',
    client: 'Roberto Díaz',
    status: 'approved',
    priority: 'urgente',
    technician: 'Ana Torres',
    bay: 'Bay 2',
    progress: 0,
    total: 720000,
    created_at: '2024-01-14T16:45:00Z',
  },
  {
    id: 'OT-2024-004',
    vehicle: 'VW Golf 2019',
    plate: 'MNOP78',
    client: 'Claudia López',
    status: 'quality_check',
    priority: 'normal',
    technician: 'Carlos Muñoz',
    bay: 'Bay 4',
    progress: 90,
    total: 320000,
    created_at: '2024-01-14T14:20:00Z',
  },
  {
    id: 'OT-2024-005',
    vehicle: 'Hyundai Tucson 2023',
    plate: 'QRST90',
    client: 'Felipe Muñoz',
    status: 'ready',
    priority: 'baja',
    technician: 'Pedro Silva',
    bay: 'Bay 5',
    progress: 100,
    total: 550000,
    created_at: '2024-01-14T11:00:00Z',
  },
];

export default function OrdenesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const showNewOrderModal = useAutoTalleresStore.getState().showNewOrderModal;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      order.plate.toLowerCase().includes(search.toLowerCase()) ||
      order.client.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">Órdenes de Trabajo</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona todas las órdenes del taller</p>
        </div>
        <button
          onClick={() => useAutoTalleresStore.setState({ showNewOrderModal: true })}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Nueva Orden
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por orden, vehículo, patente o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>
        
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
          {[
            { label: 'Todas', value: null, count: orders.length },
            { label: 'Pendiente', value: 'pending', count: 2 },
            { label: 'En Proceso', value: 'in_progress', count: 1 },
            { label: 'Diagnóstico', value: 'diagnostic', count: 1 },
            { label: 'Aprobado', value: 'approved', count: 1 },
            { label: 'Revisión', value: 'quality_check', count: 1 },
            { label: 'Listo', value: 'ready', count: 1 },
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === status.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status.label}
              <span className="ml-1 opacity-70">{status.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Orden
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Vehículo
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Cliente
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Estado
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Prioridad
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Técnico
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Total
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                  Fecha
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{order.id}</p>
                      <p className="text-xs text-slate-500">{order.plate}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">{order.vehicle}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{order.client}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityClass(order.priority)}`}>
                      {getPriorityLabel(order.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{order.technician}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{formatCLP(order.total)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/auto-talleres/ordenes/${order.id}`}
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
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No se encontraron órdenes</p>
            <p className="text-sm text-slate-400 mt-1">Intenta con otros filtros o crea una nueva orden</p>
          </div>
        )}
      </div>
    </div>
  );
}
