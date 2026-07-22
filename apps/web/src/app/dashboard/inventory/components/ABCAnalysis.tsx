'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Play, Settings, TrendingUp, Package, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

interface ABCResult {
  product_name: string;
  sku: string;
  classification: string;
  total_movement_value: number;
  movement_count: number;
  cumulative_pct: number;
  rank: number;
}

interface ABCRule {
  id: string;
  name: string;
  a_threshold: number;
  b_threshold: number;
  period_months: number;
  last_run_at: string | null;
}

interface ABCSummary {
  classification: string;
  count: number;
  total_value: number;
}

const classConfig: Record<string, { color: string; bg: string; border: string }> = {
  A: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  B: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  C: { color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
};

export default function ABCAnalysis() {
  const [results, setResults] = useState<ABCResult[]>([]);
  const [summary, setSummary] = useState<ABCSummary[]>([]);
  const [activeRule, setActiveRule] = useState<ABCRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({ a_threshold: 80, b_threshold: 95, period_months: 12 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/abc-analysis`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setResults(data.results || []);
        setSummary(data.summary || []);
        setActiveRule(data.activeRule || null);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/abc-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setResults(data.results || []);
        setSummary(data.summary || []);
        setActiveRule(data.rule);
        toast.success('Analisis ABC completado');
        setShowConfig(false);
      }
    } catch (e) { toast.error('Error al ejecutar analisis'); }
    setRunning(false);
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Analisis ABC</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors">
            <Settings className="w-3.5 h-3.5" /> Configurar
          </button>
          <button onClick={handleRun} disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
            <Play className="w-3.5 h-3.5" /> {running ? 'Ejecutando...' : 'Ejecutar'}
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Configuracion ABC</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] font-semibold text-slate-500 uppercase">Umbral A (%)</label>
              <input type="number" value={config.a_threshold} onChange={e => setConfig({ ...config, a_threshold: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-slate-500 uppercase">Umbral B (%)</label>
              <input type="number" value={config.b_threshold} onChange={e => setConfig({ ...config, b_threshold: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-slate-500 uppercase">Periodo (meses)</label>
              <input type="number" value={config.period_months} onChange={e => setConfig({ ...config, period_months: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>
      )}

      {activeRule && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-700">Resumen por Clasificacion</span>
            {activeRule.last_run_at && (
              <span className="text-[9px] text-slate-500">
                Ultima ejecucion: {new Date(activeRule.last_run_at).toLocaleDateString('es-CL')}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {summary.map(s => {
              const cfg = classConfig[s.classification] || classConfig.C;
              return (
                <div key={s.classification} className={`${cfg.bg} border ${cfg.border} rounded-xl p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${cfg.color}`}>{s.classification}</span>
                    <Package className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <p className="text-xl font-bold text-slate-900">{s.count} productos</p>
                  <p className="text-xs text-slate-500 mt-1">
                    ${Number(s.total_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {results.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Clase</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor Movimientos</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider"># Movimientos</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">% Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => {
                  const cfg = classConfig[r.classification] || classConfig.C;
                  return (
                    <tr key={r.rank} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500">{r.rank}</td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-900">{r.product_name}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{r.sku}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                          {r.classification}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-medium text-slate-900">
                        ${Number(r.total_movement_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-xs text-right text-slate-600">{r.movement_count}</td>
                      <td className="px-4 py-3 text-xs text-right text-slate-600">{r.cumulative_pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Ejecute el analisis ABC para clasificar productos</p>
        </div>
      )}
    </div>
  );
}
