'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Award, Plus, X, Save } from 'lucide-react';

interface SalesTarget {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  year: number;
  month: number;
  target_amount: number;
  actual_amount: number;
  order_count: number;
  product_category: string | null;
  achievement_pct: number;
}

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function SalesTargets() {
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({ employee_id: '', year: new Date().getFullYear(), month: new Date().getMonth() + 1, target_amount: '', product_category: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const [targetsRes, employeesRes] = await Promise.all([
        fetch(`/api/companies/${companyId}/sales-targets`),
        fetch(`/api/companies/${companyId}/employees`).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
      ]);
      if (targetsRes.ok) {
        const json = await targetsRes.json();
        setTargets(json.data || []);
      }
      if (employeesRes.ok) {
        const json = await employeesRes.json();
        setEmployees(json.data || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    const companyId = localStorage.getItem('company_id');
    const res = await fetch(`/api/companies/${companyId}/sales-targets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        target_amount: parseFloat(form.target_amount),
        product_category: form.product_category || null,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ employee_id: '', year: new Date().getFullYear(), month: new Date().getMonth() + 1, target_amount: '', product_category: '' });
      loadData();
    }
  };

  const yearTargets = targets.filter(t => t.year === selectedYear);
  const totalTarget = yearTargets.reduce((sum, t) => sum + t.target_amount, 0);
  const totalActual = yearTargets.reduce((sum, t) => sum + t.actual_amount, 0);
  const overallPct = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

  const byEmployee = yearTargets.reduce((acc, t) => {
    const key = t.employee_id;
    if (!acc[key]) acc[key] = { name: t.employee_name, targets: Array(12).fill(null), totalTarget: 0, totalActual: 0 };
    acc[key].targets[t.month - 1] = t;
    acc[key].totalTarget += t.target_amount;
    acc[key].totalActual += t.actual_amount;
    return acc;
  }, {} as Record<string, any>);

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Metas de Venta</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {[0, 1, 2].map(offset => (
              <option key={offset} value={new Date().getFullYear() - offset}>{new Date().getFullYear() - offset}</option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Nueva Meta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase">Meta Total {selectedYear}</p>
          <p className="text-xl font-bold text-slate-900 mt-1">${totalTarget.toLocaleString('en-US')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase">Logrado</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">${totalActual.toLocaleString('en-US')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase">Cumplimiento</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xl font-bold text-slate-900">{overallPct.toFixed(0)}%</p>
            {overallPct >= 100 ? (
              <Award className="w-5 h-5 text-emerald-500" />
            ) : overallPct >= 70 ? (
              <TrendingUp className="w-5 h-5 text-amber-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Vendedor</th>
                {monthNames.map((m, i) => (
                  <th key={i} className="text-center px-2 py-3 text-[9px] font-semibold text-slate-500 uppercase">{m}</th>
                ))}
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byEmployee).map(([empId, data]: [string, any]) => (
                <tr key={empId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900">{data.name}</td>
                  {data.targets.map((t: SalesTarget | null, i: number) => (
                    <td key={i} className="px-2 py-3 text-center">
                      {t ? (
                        <div>
                          <p className={`text-[10px] font-bold ${t.achievement_pct >= 100 ? 'text-emerald-600' : t.achievement_pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                            {t.achievement_pct.toFixed(0)}%
                          </p>
                          <p className="text-[9px] text-slate-400">${(t.target_amount / 1000).toFixed(0)}k</p>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <p className={`text-xs font-bold ${data.totalActual >= data.totalTarget ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {data.totalTarget > 0 ? ((data.totalActual / data.totalTarget) * 100).toFixed(0) : 0}%
                    </p>
                    <p className="text-[9px] text-slate-400">${(data.totalActual / 1000).toFixed(0)}k / ${(data.totalTarget / 1000).toFixed(0)}k</p>
                  </td>
                </tr>
              ))}
              {Object.keys(byEmployee).length === 0 && (
                <tr><td colSpan={14} className="text-center py-8 text-xs text-slate-400">Sin metas definidas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Nueva Meta</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Vendedor</label>
                <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Seleccionar...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Año</label>
                  <input type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mes</label>
                  <select value={form.month} onChange={e => setForm({ ...form, month: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Meta ($)</label>
                <input type="number" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="1000000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Categoría (opcional)</label>
                <input type="text" value={form.product_category} onChange={e => setForm({ ...form, product_category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Todos" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.employee_id || !form.target_amount}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
