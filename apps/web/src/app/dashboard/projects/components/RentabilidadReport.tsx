'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

interface RentabilidadProps {
  project: any;
  costs: any[];
  expenses: any[];
  timesheets: any[];
}

export default function RentabilidadReport({ project, costs, expenses, timesheets }: RentabilidadProps) {
  const data = useMemo(() => {
    const budget = Number(project.budget) || 0;
    const totalCosts = costs.reduce((s: number, c: any) => s + Number(c.amount), 0);
    const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
    const totalCost = totalCosts + totalExpenses;
    const totalHours = timesheets.reduce((s: number, t: any) => s + Number(t.hours), 0);
    const billableHours = timesheets.filter((t: any) => t.billable).reduce((s: number, t: any) => s + Number(t.hours), 0);
    const margin = budget - totalCost;
    const marginPercent = budget > 0 ? Math.round((margin / budget) * 100) : 0;
    const costPerHour = billableHours > 0 ? totalCost / billableHours : 0;

    return { budget, totalCosts, totalExpenses, totalCost, totalHours, billableHours, margin, marginPercent, costPerHour };
  }, [project, costs, expenses, timesheets]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-900">Reporte de Rentabilidad</h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Presupuesto</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(data.budget)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo Total</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{formatCurrency(data.totalCost)}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">{data.totalCosts > 0 ? `Compras/Inv: ${formatCurrency(data.totalCosts)}` : ''} {data.totalExpenses > 0 ? `Gastos: ${formatCurrency(data.totalExpenses)}` : ''}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Margen</p>
          <p className={`text-xl font-bold mt-1 ${data.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(data.margin)}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">{data.marginPercent}% del presupuesto</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo/Hora</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(data.costPerHour)}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">{data.billableHours}h facturables</p>
        </div>
      </div>

      {/* Margin bar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {data.margin >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
            <div>
              <p className="text-sm font-semibold text-slate-900">Margen del Proyecto</p>
              <p className="text-xs text-slate-500">{data.margin >= 0 ? 'Proyecto rentable' : 'Proyecto con perdida'}</p>
            </div>
          </div>
          <span className={`text-2xl font-bold ${data.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{data.marginPercent}%</span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${data.marginPercent >= 20 ? 'bg-emerald-500' : data.marginPercent >= 0 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(Math.max(data.marginPercent, 0), 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h4 className="text-sm font-semibold text-slate-900 mb-4">Desglose de Costos</h4>
        <div className="space-y-3">
          {[
            { label: 'Compras / Inventario', value: data.totalCosts, icon: DollarSign },
            { label: 'Gastos Directos', value: data.totalExpenses, icon: DollarSign },
            { label: 'Horas Trabajadas', value: data.totalHours, unit: 'h', icon: BarChart3 },
            { label: 'Horas Facturables', value: data.billableHours, unit: 'h', icon: BarChart3 },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className="text-sm font-semibold text-slate-900">
                {item.unit ? `${Number(item.value).toFixed(1)}${item.unit}` : formatCurrency(Number(item.value))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
