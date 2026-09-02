'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Package,
  ArrowUpRight,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { formatCLP, formatDate, getStatusBadgeClass, getStatusLabel } from '../lib/utils';

const orders = [
  {
    id: 'PO-001',
    order_number: 'PC-2024-001',
    supplier: 'Repuestos Chile SpA',
    items: 12,
    subtotal: 450000,
    iva: 94500,
    total: 544500,
    status: 'solicitado',
    expected_delivery: '2024-01-20',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'PO-002',
    order_number: 'PC-2024-002',
    supplier: 'Autopartes del Sur',
    items: 8,
    subtotal: 320000,
    iva: 67200,
    total: 387200,
    status: 'en_transito',
    expected_delivery: '2024-01-18',
    created_at: '2024-01-14T14:00:00Z',
  },
  {
    id: 'PO-003',
    order_number: 'PC-2024-003',
    supplier: 'Partes y Más',
    items: 5,
    subtotal: 180000,
    iva: 37800,
    total: 217800,
    status: 'recibido',
    expected_delivery: '2024-01-15',
    created_at: '2024-01-13T09:00:00Z',
  },
];

export default function PedidosRepuestosPage() {
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter((order) => {
    const searchLower = search.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.supplier.toLowerCase().includes(searchLower) ||
      order.order_number.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">Pedidos a Proveedores</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona compras de repuestos e insumos</p>
        </div>
        <button className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Nuevo Pedido
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Package className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pendientes</p>
              <p className="text-2xl font-black text-[#0F172A]">{orders.filter(o => o.status === 'solicitado').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Truck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">En Tránsito</p>
              <p className="text-2xl font-black text-[#0F172A]">{orders.filter(o => o.status === 'en_transito').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recibidos</p>
              <p className="text-2xl font-black text-[#0F172A]">{orders.filter(o => o.status === 'recibido').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Package className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-black text-[#0F172A]">{orders.length}</p>
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
            placeholder="Buscar pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Pedido</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Proveedor</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Items</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Entrega</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{order.id}</p>
                    <p className="text-xs text-slate-500">{order.order_number}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">{order.supplier}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{order.items} items</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{formatCLP(order.total)}</p>
                    <p className="text-xs text-slate-500">
                      {formatCLP(order.subtotal)} + IVA {formatCLP(order.iva)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-500">{formatDate(order.expected_delivery)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/auto-talleres/pedidos-repuestos/${order.id}`}
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
