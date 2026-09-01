'use client';

import { useState } from 'react';
import { FileText, TrendingUp, Wallet, Receipt, User, Star, Clock, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';
import RoleProtected from '../components/role-protected';
import { INITIAL_BOLETAS_DTE, DteBoleta } from '../lib/restaurant-store';
import { useRestaurantRole } from '../lib/role-context';

export default function RestaurantReportsPage() {
  const { canAccess } = useRestaurantRole();
  const [range, setRange] = useState<'hoy' | 'semana' | 'mes'>('hoy');

  const formatCLP = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  if (!canAccess('reports')) {
    return <RoleProtected section="reports"><div /></RoleProtected>;
  }

  const boletas = INITIAL_BOLETAS_DTE;

  const totalVentas = boletas.reduce((s, b) => s + b.totalCLP, 0);
  const totalNeto = boletas.reduce((s, b) => s + b.netoCLP, 0);
  const totalIVA = boletas.reduce((s, b) => s + b.ivaCLP, 0);
  const totalTips = boletas.reduce((s, b) => s + b.tipCLP, 0);

  const waiterMap: Record<string, string> = {};
  boletas.forEach((b) => {
    waiterMap[b.waiterName] = (waiterMap[b.waiterName] || '') + b.totalCLP;
  });

  const byWaiter = Object.entries(waiterMap)
    .map(([name, totals]) => {
      const list = boletas.filter((b) => b.waiterName === name);
      const sum = list.reduce((s, b) => s + b.totalCLP, 0);
      return { name, count: list.length, sum, tickets: list };
    })
    .sort((a, b) => b.sum - a.sum);

  const paymentMap: Record<string, number> = {};
  boletas.forEach((b) => {
    paymentMap[b.paymentMethod] = (paymentMap[b.paymentMethod] || 0) + b.totalCLP;
  });

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Reportes de Ventas & Desempeño por Garzón
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Análisis restringido a Dueño / Administrador. Ventas netas, IVA, propinas y productividad del equipo de garzones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          <button
            onClick={() => toast.success('Reporte exportado (demo).')}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-3 py-2 rounded-xl text-xs flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400"><TrendingUp className="w-4 h-4 text-emerald-500" /><p className="text-xs font-semibold text-slate-500">Ventas Brutas</p></div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCLP(totalVentas)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{boletas.length} boletas del período</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400"><Receipt className="w-4 h-4 text-blue-500" /><p className="text-xs font-semibold text-slate-500">Ticket Promedio</p></div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCLP(Math.round(totalVentas / Math.max(boletas.length, 1)))}</p>
          <p className="text-[11px] text-slate-400 mt-1">por boleta emitida</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400"><Wallet className="w-4 h-4 text-amber-500" /><p className="text-xs font-semibold text-slate-500">Propinas Total</p></div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCLP(totalTips)}</p>
          <p className="text-[11px] text-slate-400 mt-1">10% sobre consumos</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400"><Receipt className="w-4 h-4 text-rose-500" /><p className="text-xs font-semibold text-slate-500">IVA 19% Recaudado</p></div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCLP(totalIVA)}</p>
          <p className="text-[11px] text-slate-400 mt-1">sobre base neta {formatCLP(totalNeto)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desempeño por garzón */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" /> Desempeño por Garzón
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {byWaiter.map((w) => {
              const max = byWaiter[0]?.sum || 1;
              const pct = Math.round((w.sum / max) * 100);
              return (
                <div key={w.name} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-900">{w.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {w.count} boletas</span>
                      <span className="font-bold text-slate-900">{formatCLP(w.sum)}</span>
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ventas por método de pago */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-500" /> Ventas por Método de Pago
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {Object.entries(paymentMap).map(([method, amount]) => {
              const pct = Math.round((amount / Math.max(totalVentas, 1)) * 100);
              return (
                <div key={method}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 font-medium">{method}</span>
                    <span className="font-semibold text-slate-900">{formatCLP(amount)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(paymentMap).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Sin datos en el período.</p>
            )}
          </div>
        </div>
      </div>

      {/* Detalle de boletas */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-500" /> Detalle de Boletas Emitidas
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-semibold">Folio</th>
                <th className="px-5 py-3 font-semibold">Garzón</th>
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold">Neto</th>
                <th className="px-5 py-3 font-semibold">IVA</th>
                <th className="px-5 py-3 font-semibold">Propina</th>
                <th className="px-5 py-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {boletas.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">#{b.folio} <span className="text-slate-300">·</span> <span className="text-emerald-600 font-semibold">{b.siiStatus === 'Aceptado SII' ? '✔' : '·'}</span></td>
                  <td className="px-5 py-3 text-slate-700">{b.waiterName}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{b.dateTime}</td>
                  <td className="px-5 py-3 text-slate-600">{formatCLP(b.netoCLP)}</td>
                  <td className="px-5 py-3 text-slate-600">{formatCLP(b.ivaCLP)}</td>
                  <td className="px-5 py-3 text-amber-600 font-medium">{formatCLP(b.tipCLP)}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900">{formatCLP(b.totalCLP)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
