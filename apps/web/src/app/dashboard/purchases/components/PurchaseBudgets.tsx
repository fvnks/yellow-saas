'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Plus, X, Save } from 'lucide-react';

export default function PurchaseBudgets() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: '', year: new Date().getFullYear(), month: '', budget_amount: '' });

  useEffect(() => { loadData(); }, [selectedYear]);

  const loadData = async () => {
    setLoading(true);
    const companyId = localStorage.getItem('company_id');
    const res = await fetch(`/api/companies/${companyId}/purchase-budgets?year=${selectedYear}`);
    if (res.ok) { const j = await res.json(); setBudgets(j.data || []); }
    setLoading(false);
  };

  const handleSave = async () => {
    const companyId = localStorage.getItem('company_id');
    const res = await fetch(`/api/companies/${companyId}/purchase-budgets`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, budget_amount: parseFloat(form.budget_amount) || 0, month: form.month ? parseInt(form.month) : null }),
    });
    if (res.ok) { setShowForm(false); setForm({ category: '', year: new Date().getFullYear(), month: '', budget_amount: '' }); loadData(); }
  };

  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  const totalBudget = budgets.reduce((s, b) => s + b.budget_amount, 0);
  const totalActual = budgets.reduce((s, b) => s + b.actual_amount, 0);
  const totalVariance = totalBudget - totalActual;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Target className="w-4 h-4 text-slate-500" /><span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Presupuestos de Compra</span></div>
        <div className="flex items-center gap-2">
          <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            {[0,1,2].map(o => <option key={o} value={new Date().getFullYear() - o}>{new Date().getFullYear() - o}</option>)}
          </select>
          <button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"><Plus className="w-3.5 h-3.5" /> Nuevo</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800"><p className="text-[9px] font-semibold text-slate-500 uppercase">Presupuesto Total</p><p className="text-xl font-bold text-slate-900 mt-1">{fmt(totalBudget)}</p></div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800"><p className="text-[9px] font-semibold text-slate-500 uppercase">Ejecutado</p><p className="text-xl font-bold text-blue-600 mt-1">{fmt(totalActual)}</p></div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800"><p className="text-[9px] font-semibold text-slate-500 uppercase">Varianza</p><p className={`text-xl font-bold mt-1 ${totalVariance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(Math.abs(totalVariance))}</p></div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <table className="w-full">
          <thead><tr className="border-b border-slate-200">
            <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Categoría</th>
            <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Presupuesto</th>
            <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Ejecutado</th>
            <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Varianza</th>
            <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">% Uso</th>
          </tr></thead>
          <tbody>
            {budgets.map(b => {
              const pct = b.budget_amount > 0 ? (b.actual_amount / b.budget_amount) * 100 : 0;
              return (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900">{b.category}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-600">{fmt(b.budget_amount)}</td>
                  <td className="px-4 py-3 text-xs text-right font-bold text-slate-900">{fmt(b.actual_amount)}</td>
                  <td className="px-4 py-3 text-xs text-right"><span className={`font-bold ${b.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{b.variance >= 0 ? '+' : ''}{fmt(b.variance)}</span></td>
                  <td className="px-4 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold ${pct > 100 ? 'bg-red-50 text-red-700' : pct > 80 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{pct.toFixed(0)}%</span></td>
                </tr>
              );
            })}
            {budgets.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-xs text-slate-400">Sin presupuestos</td></tr>}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full dark:bg-slate-900 max-w- dark:bg-slate-900md mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">Nuevo Presupuesto</h2><button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-medium text-slate-700 mb-1">Categoría</label><input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Materia Prima, Logística..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Año</label><input type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Mes (opcional)</label><select value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"><option value="">Anual</option>{['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map((m, i) => i > 0 ? <option key={i} value={i}>{m}</option> : null)}</select></div>
              </div>
              <div><label className="block text-xs font-medium text-slate-700 mb-1">Monto ($)</label><input type="number" value={form.budget_amount} onChange={e => setForm({ ...form, budget_amount: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="5000000" /></div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.category} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"><Save className="w-3.5 h-3.5" /> Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
