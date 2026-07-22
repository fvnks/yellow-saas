'use client';

import { useState, useEffect } from 'react';
import { Star, Gift, TrendingUp, Award, Plus, X, Save, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface CustomerLoyalty {
  id: string;
  name: string;
  tax_id: string;
  total_earned: number;
  total_redeemed: number;
  balance: number;
  last_activity: string;
}

interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  customer_name: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  reference_type: string;
  reference_id: string;
  created_at: string;
}

export default function LoyaltyProgram() {
  const [customers, setCustomers] = useState<CustomerLoyalty[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'summary' | 'transactions'>('summary');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ action: 'earn' as 'earn' | 'redeem', customer_id: '', points: '', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const [summaryRes, txRes, custRes] = await Promise.all([
        fetch(`/api/companies/${companyId}/loyalty?type=summary`),
        fetch(`/api/companies/${companyId}/loyalty?type=transactions`),
        fetch(`/api/companies/${companyId}/customers`).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
      ]);
      if (summaryRes.ok) { const json = await summaryRes.json(); setCustomers(json.data || []); }
      if (txRes.ok) { const json = await txRes.json(); setTransactions(json.data || []); }
      if (custRes.ok) { const json = await custRes.json(); setAllCustomers(json.data || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    const companyId = localStorage.getItem('company_id');
    const res = await fetch(`/api/companies/${companyId}/loyalty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, points: parseInt(form.points) }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ action: 'earn', customer_id: '', points: '', description: '' });
      loadData();
    }
  };

  const totalPoints = customers.reduce((s, c) => s + c.balance, 0);
  const activeCustomers = customers.filter(c => c.balance > 0).length;

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Programa de Lealtad</span>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Registrar Puntos
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase">Puntos Totales</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{totalPoints.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase">Clientes Activos</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{activeCustomers}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase">Total Canjeado</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{customers.reduce((s, c) => s + c.total_redeemed, 0).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setActiveView('summary')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeView === 'summary' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          Resumen
        </button>
        <button onClick={() => setActiveView('transactions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeView === 'transactions' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          Movimientos
        </button>
      </div>

      {activeView === 'summary' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Cliente</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Ganados</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Canjeados</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-slate-900">{c.name}</p>
                    <p className="text-[9px] text-slate-500">{c.tax_id}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-right text-slate-600">{c.total_earned.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-right text-red-500">-{c.total_redeemed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${c.balance > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <Star className="w-3 h-3" /> {c.balance.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-xs text-slate-400">Sin clientes registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeView === 'transactions' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Tipo</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Cliente</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Descripción</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Puntos</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    {t.type === 'earned' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700">
                        <ArrowUpCircle className="w-3 h-3" /> Ganado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-red-50 text-red-700">
                        <ArrowDownCircle className="w-3 h-3" /> Canjeado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-900">{t.customer_name}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{t.description}</td>
                  <td className={`px-4 py-3 text-xs text-right font-bold ${t.type === 'earned' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'earned' ? '+' : '-'}{t.points.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-right text-slate-500">{new Date(t.created_at).toLocaleDateString('es-CL')}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-xs text-slate-400">Sin movimientos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Registrar Puntos</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Acción</label>
                <div className="flex gap-2">
                  <button onClick={() => setForm({ ...form, action: 'earn' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${form.action === 'earn' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <ArrowUpCircle className="w-4 h-4 inline mr-1" /> Ganar
                  </button>
                  <button onClick={() => setForm({ ...form, action: 'redeem' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${form.action === 'redeem' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <ArrowDownCircle className="w-4 h-4 inline mr-1" /> Canjear
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cliente</label>
                <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Seleccionar...</option>
                  {allCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Puntos</label>
                <input type="number" value={form.points} onChange={e => setForm({ ...form, points: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Descripción</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Compra #1234" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.customer_id || !form.points}
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
