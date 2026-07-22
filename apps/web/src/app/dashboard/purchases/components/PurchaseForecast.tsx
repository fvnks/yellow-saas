'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export default function PurchaseForecast() {
  const [monthly, setMonthly] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [seasonality, setSeasonality] = useState<number[]>([]);
  const [avgMonthly, setAvgMonthly] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/purchase-forecast`)
      .then(r => r.json()).then(d => { const data = d.data || {}; setMonthly(data.monthly || []); setForecast(data.forecast || []); setSeasonality(data.seasonality || []); setAvgMonthly(data.avgMonthly || 0); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  const last12 = monthly.slice(-12);
  const maxVal = Math.max(...last12.map(m => m.total), ...forecast.map(f => f.confidence_high), 1);

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-slate-500" /><span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Pronóstico de Compras</span></div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase">Promedio Mensual</p><p className="text-xl font-bold text-slate-900 mt-1">{fmt(avgMonthly)}</p></div>
        <div className="bg-white border border-slate-200 rounded-xl p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase">Próximo Mes</p><p className="text-xl font-bold text-emerald-600 mt-1">{fmt(forecast[0]?.predicted_total || 0)}</p></div>
        <div className="bg-white border border-slate-200 rounded-xl p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase">Rango</p><p className="text-xs text-slate-600 mt-2">{fmt(forecast[0]?.confidence_low || 0)} — {fmt(forecast[0]?.confidence_high || 0)}</p></div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-900 mb-4">Histórico + Pronóstico</h3>
        <div className="flex items-end gap-1 h-40">
          {last12.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-blue-500 rounded-t opacity-80" style={{ height: `${(m.total / maxVal) * 120}px` }}></div>
              <p className="text-[7px] text-slate-500 mt-1">{monthNames[m.month - 1]?.substring(0, 3)}</p>
            </div>
          ))}
          {forecast.map((f, i) => (
            <div key={`f${i}`} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-emerald-500 border-2 border-dashed border-emerald-400 rounded-t opacity-70" style={{ height: `${(f.predicted_total / maxVal) * 120}px` }}></div>
              <p className="text-[7px] text-emerald-600 font-semibold mt-1">{monthNames[f.month - 1]?.substring(0, 3)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-xs font-semibold text-slate-900">Pronóstico 3 Meses</h3></div>
        <table className="w-full">
          <thead><tr className="border-b border-slate-200">
            <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Período</th>
            <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Estimado</th>
            <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Órdenes</th>
            <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Rango</th>
          </tr></thead>
          <tbody>
            {forecast.map((f, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-xs font-medium text-slate-900">{monthNames[f.month - 1]} {f.year}</td>
                <td className="px-4 py-3 text-xs text-right font-bold text-emerald-600">{fmt(f.predicted_total)}</td>
                <td className="px-4 py-3 text-xs text-center text-slate-600">{f.predicted_orders}</td>
                <td className="px-4 py-3 text-xs text-right text-slate-600">{fmt(f.confidence_low)} — {fmt(f.confidence_high)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
