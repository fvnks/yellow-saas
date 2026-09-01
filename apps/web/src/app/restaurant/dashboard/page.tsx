'use client';

import { useState } from 'react';
import { LayoutDashboard, TrendingUp, DollarSign, User, Clock, UtensilsCrossed, CalendarCheck, Receipt, Wallet } from 'lucide-react';
import Link from 'next/link';
import { INITIAL_TABLES, INITIAL_RESERVATIONS, INITIAL_MENU_ITEMS } from '../lib/restaurant-store';

export default function RestaurantDashboardPage() {
  const [range, setRange] = useState<'hoy' | 'semana' | 'mes'>('hoy');

  const formatCLP = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const tables = INITIAL_TABLES;
  const reservations = INITIAL_RESERVATIONS;

  const occupied = tables.filter((t) => t.status === 'occupied' || t.status === 'bill_requested').length;
  const free = tables.filter((t) => t.status === 'free').length;
  const busyPct = Math.round((occupied / Math.max(tables.length, 1)) * 100);

  const stats = {
    ventas: 428600,
    ticketPromedio: 13824,
    clientes: 186,
    propinas: 38960,
  };

  const categoriaMap: Record<string, number> = {};
  INITIAL_MENU_ITEMS.forEach((m) => {
    categoriaMap[m.category] = (categoriaMap[m.category] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-amber-500" />
            Dashboard Restaurante
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Resumen operativo del día: ventas CLP, ocupación de mesas, reservas, horas pico y DTE.
          </p>
        </div>

        <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
          {(['hoy', 'semana', 'mes'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${range === r ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {r === 'hoy' ? 'Hoy' : r === 'semana' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Ventas del Día</p>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCLP(stats.ventas)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">▲ 12% vs ayer</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Ticket Promedio</p>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCLP(stats.ticketPromedio)}</p>
          <p className="text-[11px] text-slate-400 mt-1">por boleta</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Clientes Atendidos</p>
            <User className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.clientes}</p>
          <p className="text-[11px] text-slate-400 mt-1">comensales</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Propinas Acumuladas</p>
            <Wallet className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCLP(stats.propinas)}</p>
          <p className="text-[11px] text-slate-400 mt-1">10% sobre consumo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ocupación de mesas */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Ocupación de Mesas</h3>
            <Link href="/restaurant/waiter" className="text-xs font-semibold text-amber-600 hover:text-amber-700">Ver POS →</Link>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-slate-900">{occupied}</span>
              <span className="text-sm text-slate-400 mb-1">de {tables.length} mesas</span>
            </div>
            <div className="mt-3 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${busyPct}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-amber-50 border border-amber-100 py-2">
                <p className="text-sm font-bold text-amber-700">{occupied}</p>
                <p className="text-[10px] text-amber-600 font-semibold uppercase">Ocupadas</p>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 py-2">
                <p className="text-sm font-bold text-emerald-700">{free}</p>
                <p className="text-[10px] text-emerald-600 font-semibold uppercase">Libres</p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-100 py-2">
                <p className="text-sm font-bold text-blue-700">{reservations.filter(r => r.status !== 'cancelled').length}</p>
                <p className="text-[10px] text-blue-600 font-semibold uppercase">Reservas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Horas pico */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Horas Pico de Servicio
            </h3>
          </div>
          <div className="p-5 flex items-end gap-2 h-40">
            {[
              { h: '12:00', v: 55 },
              { h: '13:00', v: 100 },
              { h: '14:00', v: 80 },
              { h: '19:00', v: 40 },
              { h: '20:00', v: 70 },
              { h: '21:00', v: 90 },
              { h: '22:00', v: 60 },
            ].map((b) => (
              <div key={b.h} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-amber-500/80 hover:bg-[#EAB308] transition-colors" style={{ height: `${b.v}%` }} />
                <span className="text-[9px] font-semibold text-slate-400">{b.h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platos más vendidos */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-amber-500" /> Platos Más Vendidos
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {INITIAL_MENU_ITEMS.slice(0, 5).map((m, i) => (
              <div key={m.id} className="px-4 py-2.5 flex items-center gap-3">
                <span className="text-xs font-black text-slate-300 w-4">{i + 1}</span>
                <span className="text-xs">{m.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{m.name}</p>
                  <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${100 - i * 15}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900">{formatCLP(m.priceCLP)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reservas próximas */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-amber-500" /> Próximas Reservas
          </h3>
          <Link href="/restaurant/reservations" className="text-xs font-semibold text-amber-600 hover:text-amber-700">Gestionar →</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {reservations.map((r) => (
            <div key={r.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-black">
                  {r.customerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.customerName}</p>
                  <p className="text-xs text-slate-400">{r.tableName} · {r.peopleCount} personas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{r.time}</p>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${r.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {r.status === 'confirmed' ? 'Confirmada' : 'Sentada'}
                </span>
              </div>
            </div>
          ))}
          {reservations.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">Sin reservas próximas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
