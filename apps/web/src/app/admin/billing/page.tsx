'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Building2, Users, Calendar, Edit3, CheckCircle, AlertTriangle, Save } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  created_at: string;
  trial_ends_at: string | null;
  user_count: number;
}

interface Plan {
  name: string;
  label: string;
  max_users: number;
  price_monthly: number;
}

export default function AdminBillingPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ plan: '', status: '', trial_ends_at: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      const res = await fetch('/api/super-admin/billing', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data.companies);
        setPlans(data.data.plans);
      }
    } catch (err) {
      console.error('Failed to load billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (company: Company) => {
    setEditingId(company.id);
    setEditForm({ plan: company.plan, status: company.status, trial_ends_at: company.trial_ends_at || '' });
    setMessage({ type: '', text: '' });
  };

  const handleSave = async (companyId: string) => {
    setSaving(true);
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      const res = await fetch('/api/super-admin/billing', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, ...editForm }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Plan actualizado correctamente' });
        setEditingId(null);
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Error al actualizar' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const planColors: Record<string, string> = {
    free: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    starter: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    professional: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    enterprise: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    trial: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    suspended: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Planes y Billing</h1>
        <p className="text-sm text-slate-400 mt-1">Gestiona los planes y estados de las empresas</p>
      </div>

      {/* Plans Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${planColors[plan.name] || planColors.free}`}>
                {plan.label}
              </span>
              <CreditCard className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-2xl font-bold text-white">${plan.price_monthly.toLocaleString('es-CL')}</p>
            <p className="text-xs text-slate-500 mt-1">/mes</p>
            <p className="text-xs text-slate-400 mt-2">
              {plan.max_users === -1 ? 'Usuarios ilimitados' : `Hasta ${plan.max_users} usuarios`}
            </p>
          </div>
        ))}
      </div>

      {message.text && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Companies Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Plan</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Usuarios</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Trial</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">No hay empresas</td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{company.name}</p>
                        <p className="text-xs text-slate-500">{company.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === company.id ? (
                      <select
                        value={editForm.plan}
                        onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {plans.map((p) => <option key={p.name} value={p.name}>{p.label}</option>)}
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${planColors[company.plan] || planColors.free}`}>
                        {company.plan}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === company.id ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="active">Activo</option>
                        <option value="trial">Prueba</option>
                        <option value="suspended">Suspendido</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusColors[company.status] || statusColors.active}`}>
                        {company.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-300">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {company.user_count}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === company.id ? (
                      <input
                        type="date"
                        value={editForm.trial_ends_at ? editForm.trial_ends_at.split('T')[0] : ''}
                        onChange={(e) => setEditForm({ ...editForm, trial_ends_at: e.target.value })}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">
                        {company.trial_ends_at ? new Date(company.trial_ends_at).toLocaleDateString('es-CL') : '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === company.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSave(company.id)}
                          disabled={saving}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                        >
                          <span className="text-xs">Cancelar</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(company)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
