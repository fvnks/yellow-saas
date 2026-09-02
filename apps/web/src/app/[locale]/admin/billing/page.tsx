'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Building2, Users, Edit3, CheckCircle, AlertTriangle, Save, Plus, Trash2, GripVertical } from 'lucide-react';

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
  id: string;
  name: string;
  label: string;
  max_users: number;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export default function AdminBillingPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ plan: '', status: '', trial_ends_at: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({ name: '', label: '', max_users: -1, price_monthly: 0, price_yearly: 0, features: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const getToken = () => document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

  const fetchData = async () => {
    try {
      const res = await fetch('/api/super-admin/billing', {
        headers: { Authorization: `Bearer ${getToken()}` },
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

  const handleSaveCompany = async (companyId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/super-admin/billing', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, ...editForm }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Empresa actualizada correctamente' });
        setEditingId(null);
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Error al actualizar' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexion' });
    } finally {
      setSaving(false);
    }
  };

  const startEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      label: plan.label,
      max_users: plan.max_users,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      features: (plan.features || []).join(', '),
    });
    setShowPlanForm(true);
    setMessage({ type: '', text: '' });
  };

  const startCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({ name: '', label: '', max_users: -1, price_monthly: 0, price_yearly: 0, features: '' });
    setShowPlanForm(true);
    setMessage({ type: '', text: '' });
  };

  const handleSavePlan = async () => {
    setSaving(true);
    try {
      const payload = {
        ...planForm,
        max_users: Number(planForm.max_users),
        price_monthly: Number(planForm.price_monthly),
        price_yearly: Number(planForm.price_yearly),
        features: planForm.features.split(',').map(f => f.trim()).filter(Boolean),
      };

      const method = editingPlan ? 'PUT' : 'POST';
      const body = editingPlan ? { id: editingPlan.id, ...payload } : payload;

      const res = await fetch('/api/super-admin/plans', {
        method,
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: editingPlan ? 'Plan actualizado' : 'Plan creado' });
        setShowPlanForm(false);
        setEditingPlan(null);
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Error al guardar plan' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexion' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('¿Eliminar este plan?')) return;
    try {
      const res = await fetch(`/api/super-admin/plans?id=${planId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Plan eliminado' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Error al eliminar' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexion' });
    }
  };

  const planColors: Record<string, string> = {
    free: 'bg-muted0/10 text-muted-foreground border-border/20',
    starter: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    professional: 'bg-blue-600/10 text-blue-500 border-blue-500/20',
    enterprise: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    trial: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    suspended: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    cancelled: 'bg-muted0/10 text-muted-foreground border-border/20',
  };

  const getPlanColor = (planName: string) => planColors[planName] || 'bg-muted0/10 text-muted-foreground border-border/20';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Planes y Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona los planes, precios y estados de las empresas</p>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Plans Management */}
      <div className="bg-slate-900/80 border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Planes de la Plataforma</h3>
          <button
            onClick={startCreatePlan}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Plan
          </button>
        </div>

        {showPlanForm && (
          <div className="px-6 py-4 border-b border-border bg-card/30">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {editingPlan ? 'Editar Plan' : 'Crear Plan'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {!editingPlan && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Nombre (ID)</label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="ej: premium"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Etiqueta</label>
                <input
                  type="text"
                  value={planForm.label}
                  onChange={(e) => setPlanForm({ ...planForm, label: e.target.value })}
                  placeholder="ej: Premium"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Max Usuarios (-1 = ilimitado)</label>
                <input
                  type="number"
                  value={planForm.max_users}
                  onChange={(e) => setPlanForm({ ...planForm, max_users: parseInt(e.target.value) || -1 })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Precio Mensual (CLP)</label>
                <input
                  type="number"
                  value={planForm.price_monthly}
                  onChange={(e) => setPlanForm({ ...planForm, price_monthly: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Precio Anual (CLP)</label>
                <input
                  type="number"
                  value={planForm.price_yearly}
                  onChange={(e) => setPlanForm({ ...planForm, price_yearly: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSavePlan}
                  disabled={saving}
                  className="px-4 py-2 bg-slate-900/80 hover:bg-slate-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => { setShowPlanForm(false); setEditingPlan(null); }}
                  className="px-4 py-2 bg-muted hover:bg-muted rounded-lg text-sm font-medium text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Features (separados por coma)</label>
              <input
                type="text"
                value={planForm.features}
                onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                placeholder="Inventario completo, CRM, Soporte 24/7"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
            </div>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 relative group">
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${getPlanColor(plan.name)}`}>
                  {plan.label}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEditPlan(plan)} className="p-1 hover:bg-slate-700 rounded text-muted-foreground hover:text-white transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeletePlan(plan.id)} className="p-1 hover:bg-rose-500/20 rounded text-muted-foreground hover:text-rose-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {plan.price_monthly === 0 ? 'Gratis' : `$${plan.price_monthly.toLocaleString('es-CL')}`}
              </p>
              {plan.price_monthly > 0 && <p className="text-xs text-muted-foreground">/mes</p>}
              <p className="text-xs text-muted-foreground mt-2">
                {plan.max_users === -1 ? 'Usuarios ilimitados' : `Hasta ${plan.max_users} usuarios`}
              </p>
              {plan.features && plan.features.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {plan.features.slice(0, 3).map((f: string, i: number) => (
                    <li key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-[10px] text-foreground">+{plan.features.length - 3} mas</li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-slate-900/80 border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-white">Empresas ({companies.length})</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Empresa</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Plan</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Usuarios</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Trial</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-card rounded animate-pulse" /></td>
                </tr>
              ))
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">No hay empresas</td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="border-b border-border/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-card rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === company.id ? (
                      <select
                        value={editForm.plan}
                        onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                        className="bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                      >
                        {plans.map((p) => <option key={p.id} value={p.name}>{p.label}</option>)}
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${getPlanColor(company.plan)}`}>
                        {company.plan}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === company.id ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30"
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
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      {company.user_count}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === company.id ? (
                      <input
                        type="date"
                        value={editForm.trial_ends_at ? editForm.trial_ends_at.split('T')[0] : ''}
                        onChange={(e) => setEditForm({ ...editForm, trial_ends_at: e.target.value })}
                        className="bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {company.trial_ends_at ? new Date(company.trial_ends_at).toLocaleDateString('es-CL') : '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === company.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveCompany(company.id)}
                          disabled={saving}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-muted hover:bg-muted rounded-lg text-white transition-colors"
                        >
                          <span className="text-xs">Cancelar</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(company)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-card hover:bg-slate-700 rounded-lg text-xs font-medium text-foreground hover:text-white transition-colors"
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
