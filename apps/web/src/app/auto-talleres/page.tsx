'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Car,
  Clock,
  Users,
  Building2,
  FileText,
  Calendar,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Timer,
  Package,
} from 'lucide-react';
import { formatCLP } from './lib/utils';

interface DashboardStats {
  vehicleCount: number;
  activeOrdersCount: number;
  totalRevenue: number;
  technicianCount: number;
  occupiedBays: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  total: number;
  patente: string;
  brand: string;
  model: string;
  client_name: string;
  created_at: string;
}

export default function AutoTalleresDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    vehicleCount: 0,
    activeOrdersCount: 0,
    totalRevenue: 0,
    technicianCount: 0,
    occupiedBays: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const companyId = process.env.NEXT_PUBLIC_COMPANY_ID || '';
        const [statsRes, ordersRes] = await Promise.all([
          fetch(`/api/auto-talleres/stats?company_id=${companyId}`),
          fetch(`/api/auto-talleres/orders?company_id=${companyId}&limit=5`),
        ]);
        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();
        if (statsData.success) setStats(statsData.data);
        if (ordersData.success) setRecentOrders(ordersData.data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-orange-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-orange-500/20 text-orange-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-orange-500/30 uppercase tracking-wider">
                Módulo Talleres Automotrices
              </span>
              <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                DTE SII & CLP
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Consola Operativa Taller
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Gestión integral de órdenes de trabajo, vehículos, técnicos y presupuestos con facturación electrónica SII integrada.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/auto-talleres/ordenes/new"
              className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Nueva Orden
            </Link>
            <Link
              href="/auto-talleres/vehiculos/new"
              className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
            >
              <Car className="w-4 h-4" />
              Registrar Vehículo
            </Link>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      {/* KPI Stats */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehículos Registrados</p>
                <p className="text-3xl font-black text-[#0F172A] mt-1">{stats.vehicleCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <Car className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Órdenes Activas</p>
                <p className="text-3xl font-black text-[#0F172A] mt-1">{stats.activeOrdersCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue del Mes</p>
                <p className="text-3xl font-black text-[#0F172A] mt-1">{formatCLP(stats.totalRevenue)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Técnicos Activos</p>
                <p className="text-3xl font-black text-[#0F172A] mt-1">{stats.technicianCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Work Orders Activity */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Órdenes Recientes</h3>
            <Link
              href="/auto-talleres/ordenes"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              Ver todas
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No hay órdenes aún</p>
                <Link href="/auto-talleres/ordenes/new" className="text-xs text-orange-600 font-semibold mt-1 inline-block">
                  Crear primera orden
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100"
                  >
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                      order.status === 'in_progress' ? 'bg-blue-500' :
                      order.status === 'diagnostic' ? 'bg-amber-500' :
                      order.status === 'approved' ? 'bg-purple-500' :
                      order.status === 'quality_check' ? 'bg-orange-500' :
                      order.status === 'ready' ? 'bg-emerald-500' :
                      order.status === 'checkin' ? 'bg-slate-400' :
                      'bg-slate-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">{order.order_number}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          order.priority === 'urgente' ? 'bg-rose-100 text-rose-700' :
                          order.priority === 'alta' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {order.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {order.brand} {order.model}
                      </p>
                      <p className="text-xs text-slate-500">{order.patente} · {order.client_name}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-slate-700">{formatCLP(order.total)}</p>
                    </div>
                    <Link
                      href={`/auto-talleres/ordenes/${order.id}`}
                      className="flex-shrink-0 p-2 hover:bg-slate-200/50 rounded-lg transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Bays Status */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80">
              <h3 className="text-sm font-bold text-slate-900">Estado de Bays</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {[
                  { number: 'Bay 1', type: 'general', status: 'occupied', order: 'OT-2024-002' },
                  { number: 'Bay 2', type: 'elevador', status: 'available', order: null },
                  { number: 'Bay 3', type: 'general', status: 'occupied', order: 'OT-2024-001' },
                  { number: 'Bay 4', type: 'alineacion', status: 'occupied', order: 'OT-2024-004' },
                  { number: 'Bay 5', type: 'express', status: 'available', order: null },
                ].map((bay) => (
                  <div key={bay.number} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        bay.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{bay.number}</p>
                        <p className="text-xs text-slate-500 capitalize">{bay.type}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      bay.status === 'available'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {bay.status === 'available' ? 'Libre' : 'Ocupado'}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/auto-talleres/bays"
                className="mt-4 w-full text-center text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Gestionar Bays
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Technicians */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Técnicos Activos</h3>
              <Link
                href="/auto-talleres/tecnicos"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                Ver todos
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {[
                  { name: 'Carlos Muñoz', specialty: 'Mecánica General', activeOrders: 3, avgRating: 4.8 },
                  { name: 'Pedro Silva', specialty: 'Electricidad', activeOrders: 2, avgRating: 4.6 },
                  { name: 'Ana Torres', specialty: 'Frenos & Suspensión', activeOrders: 1, avgRating: 4.9 },
                ].map((tech) => (
                  <div key={tech.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Users className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{tech.name}</p>
                      <p className="text-xs text-slate-500">{tech.specialty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-700">{tech.activeOrders}</p>
                      <p className="text-xs text-slate-500">órdenes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80">
              <h3 className="text-sm font-bold text-slate-900">Acciones Rápidas</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { icon: Plus, label: 'Nueva Orden', path: '/auto-talleres/ordenes/new', color: 'orange' },
                { icon: Car, label: 'Registrar Vehículo', path: '/auto-talleres/vehiculos/new', color: 'blue' },
                { icon: FileText, label: 'Crear Estimado', path: '/auto-talleres/estimados/new', color: 'purple' },
                { icon: Calendar, label: 'Agendar Cita', path: '/auto-talleres/agenda/new', color: 'emerald' },
                { icon: ShieldCheck, label: 'Nueva Inspección', path: '/auto-talleres/inspecciones/new', color: 'amber' },
                { icon: Package, label: 'Pedido Repuestos', path: '/auto-talleres/pedidos-repuestos/new', color: 'rose' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.path}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-all hover:shadow-sm active:scale-[0.98]`}
                >
                  <action.icon className={`w-6 h-6 text-${action.color}-500`} />
                  <span className="text-xs font-semibold text-slate-700 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tasa de Conversión</p>
              <p className="text-2xl font-black text-[#0F172A]">78%</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Estimados convertidos a órdenes</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Timer className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tiempo Promedio</p>
              <p className="text-2xl font-black text-[#0F172A]">2.4 horas</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Desde check-in hasta entrega</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <AlertCircle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Repuestos Pendientes</p>
              <p className="text-2xl font-black text-[#0F172A]">5</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Órdenes esperando repuestos</p>
        </div>
      </div>
    </div>
  );
}