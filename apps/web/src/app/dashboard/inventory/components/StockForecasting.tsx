'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Package, ArrowDown, BarChart3 } from 'lucide-react';

interface Forecast {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  min_stock: number;
  avg_daily_demand: number;
  adjusted_daily_demand: number;
  demand_trend: string;
  projected_stockout_days: number | null;
  reorder_point: number;
  reorder_qty: number;
  recommended_reorder: boolean;
  forecast: { date: string; stock: number }[];
}

export default function StockForecasting() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);

  useEffect(() => { loadForecasts(); }, [days]);

  const loadForecasts = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/inventory-reports/forecasting?days=${days}`);
      if (res.ok) {
        const json = await res.json();
        setForecasts(json.data.forecasts || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const trendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === 'decreasing') return <TrendingDown className="w-4 h-4 text-emerald-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const trendLabel = (trend: string) => {
    if (trend === 'increasing') return 'Creciente';
    if (trend === 'decreasing') return 'Decreciente';
    return 'Estable';
  };

  const urgencyColor = (daysLeft: number | null) => {
    if (daysLeft === null) return 'text-slate-400';
    if (daysLeft <= 7) return 'text-red-600';
    if (daysLeft <= 14) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Pronostico de Stock</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500">
            <option value={15}>15 dias</option>
            <option value={30}>30 dias</option>
            <option value={60}>60 dias</option>
            <option value={90}>90 dias</option>
          </select>
        </div>
      </div>

      {forecasts.filter(f => f.recommended_reorder).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-semibold text-red-700">
              {forecasts.filter(f => f.recommended_reorder).length} productos necesitan reorden
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : forecasts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Sin datos suficientes para pronosticar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {forecasts.map(f => (
            <div key={f.id} className={`bg-white border rounded-xl p-4 transition-colors ${f.recommended_reorder ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{f.name}</p>
                    <p className="text-[9px] text-slate-500">{f.sku}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{f.current_stock}</p>
                    <p className="text-[9px] text-slate-500">Stock Actual</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${urgencyColor(f.projected_stockout_days)}`}>
                      {f.projected_stockout_days !== null ? `${f.projected_stockout_days}d` : '—'}
                    </p>
                    <p className="text-[9px] text-slate-500">Agotamiento</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      {trendIcon(f.demand_trend)}
                      <p className="text-xs font-medium text-slate-700">{trendLabel(f.demand_trend)}</p>
                    </div>
                    <p className="text-[9px] text-slate-500">{f.adjusted_daily_demand}/dia</p>
                  </div>
                  {f.recommended_reorder && (
                    <div className="bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                      <p className="text-[9px] font-semibold text-red-700 uppercase">Reorden</p>
                      <p className="text-sm font-bold text-red-900">{f.reorder_qty} uds</p>
                    </div>
                  )}
                </div>
              </div>
              {f.forecast && f.forecast.length > 0 && (
                <div className="mt-3 flex items-end gap-px h-8">
                  {f.forecast.filter((_: any, i: number) => i % Math.ceil(f.forecast.length / 15) === 0).map((point: any, i: number) => {
                    const maxStock = f.current_stock || 1;
                    const height = Math.max(2, (point.stock / maxStock) * 100);
                    const isLow = point.stock <= (f.min_stock || 0);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full rounded-sm transition-all ${isLow ? 'bg-red-400' : 'bg-indigo-300'}`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
