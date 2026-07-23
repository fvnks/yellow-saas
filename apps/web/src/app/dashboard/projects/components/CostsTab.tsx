'use client';

import { useMemo } from 'react';
import { Badge } from '@yellow-erp/ui';
import { DollarSign, ShoppingCart, Package, Wallet, Receipt, TrendingUp } from 'lucide-react';

interface Cost {
  id: string;
  source_type: string;
  category: string;
  description: string | null;
  amount: number;
  cost_date: string;
}

interface CostsTabProps {
  costs: Cost[];
  budget: number;
}

const sourceConfig: Record<string, { label: string; icon: any; color: string }> = {
  purchase: { label: 'Compras', icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
  inventory: { label: 'Inventario', icon: Package, color: 'text-amber-600 bg-amber-50' },
  payroll: { label: 'Nómina', icon: Wallet, color: 'text-emerald-600 bg-emerald-50' },
  expense: { label: 'Gastos', icon: Receipt, color: 'text-rose-600 bg-rose-50' },
  manual: { label: 'Manual', icon: DollarSign, color: 'text-slate-600 bg-slate-50' },
};

export default function CostsTab({ costs, budget }: CostsTabProps) {
  const summary = useMemo(() => {
    const bySource: Record<string, number> = {};
    costs.forEach(c => {
      bySource[c.source_type] = (bySource[c.source_type] || 0) + Number(c.amount);
    });
    const total = costs.reduce((s, c) => s + Number(c.amount), 0);
    return { bySource, total };
  }, [costs]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
  const budgetNum = Number(budget) || 0;
  const remaining = budgetNum - summary.total;
  const percentUsed = budgetNum > 0 ? Math.round((summary.total / budgetNum) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Centro de Costos</h3>

        {/* Budget vs Actual */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Presupuesto vs Real</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.total)}</p>
              <p className="text-xs text-slate-500 mt-0.5">de {formatCurrency(budgetNum)} presupuestado</p>
            </div>
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${percentUsed > 100 ? 'bg-red-50' : percentUsed > 80 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
              <TrendingUp className={`w-8 h-8 ${percentUsed > 100 ? 'text-red-600' : percentUsed > 80 ? 'text-amber-600' : 'text-emerald-600'}`} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Ejecutado</span>
              <span className="font-medium text-slate-900">{percentUsed}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${percentUsed > 100 ? 'bg-red-500' : percentUsed > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{formatCurrency(remaining)} {remaining >= 0 ? 'disponible' : 'excedido'}</span>
              <span>{formatCurrency(budgetNum)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Costs by Source */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(sourceConfig).map(([key, config]) => {
          const amount = summary.bySource[key] || 0;
          const Icon = config.icon;
          return (
            <div key={key} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{config.label}</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(amount)}</p>
            </div>
          );
        })}
      </div>

      {/* Cost Details */}
      {costs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <div className="px-6 py-4 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-900">Detalle de Costos</h4>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fuente</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripcion</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody>
              {costs.slice(0, 20).map(c => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-700">{new Date(c.cost_date).toLocaleDateString('es-CL')}</td>
                  <td className="px-4 py-3">
                    <Badge variant={sourceConfig[c.source_type]?.label ? 'info' : 'neutral'}>{sourceConfig[c.source_type]?.label || c.source_type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">{c.category}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{c.description || '—'}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900 text-right">{formatCurrency(Number(c.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {costs.length === 0 && (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <DollarSign className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No hay costos registrados</p>
          <p className="text-xs text-slate-400 mt-1">Los costos se agregan desde compras, inventario y nomina</p>
        </div>
      )}
    </div>
  );
}
