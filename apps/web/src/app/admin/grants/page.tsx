'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Search, Building2, Shield, CheckCircle, XCircle, Clock, AlertTriangle, Plus, X } from 'lucide-react';

interface Grant {
  id: string;
  company_name: string;
  company_id: string;
  super_admin_name: string;
  super_admin_email: string;
  access_level: string;
  reason: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  granted_by_name: string;
}

interface Company {
  id: string;
  name: string;
  slug: string;
}

export default function AdminGrantsPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ company_id: '', access_level: 'read', reason: '', expires_at: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchGrants();
    fetchCompanies();
  }, []);

  const getToken = () => document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

  const fetchGrants = async () => {
    try {
      const res = await fetch('/api/super-admin/grants', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setGrants(data.data);
    } catch (err) {
      console.error('Failed to load grants:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/super-admin/companies', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setCompanies(data.data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/super-admin/grants', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: form.company_id,
          access_level: form.access_level,
          reason: form.reason || undefined,
          expires_at: form.expires_at || undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Acceso creado correctamente' });
        setForm({ company_id: '', access_level: 'read', reason: '', expires_at: '' });
        setShowCreate(false);
        fetchGrants();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Error al crear' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (grantId: string) => {
    if (!confirm('¿Revocar este acceso?')) return;
    try {
      await fetch(`/api/super-admin/grants/${grantId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchGrants();
    } catch (err) {
      console.error('Failed to revoke grant:', err);
    }
  };

  const filtered = grants.filter(g => {
    if (filter === 'active') return g.is_active;
    if (filter === 'inactive') return !g.is_active;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Accesos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona los accesos de super admin a empresas</p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setMessage({ type: '', text: '' }); }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-700 rounded-lg text-sm font-medium text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showCreate ? 'Cancelar' : 'Nuevo Acceso'}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-slate-900/80 border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Crear Acceso</h3>
          {message.text && (
            <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {message.text}
            </div>
          )}
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Empresa</label>
              <select
                value={form.company_id}
                onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                required
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              >
                <option value="">Seleccionar empresa...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nivel de Acceso</label>
              <select
                value={form.access_level}
                onChange={(e) => setForm({ ...form, access_level: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              >
                <option value="read">Lectura</option>
                <option value="full">Completo</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Motivo</label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Ej: Soporte técnico"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Expira (opcional)</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-slate-900/80 hover:bg-slate-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              >
                {saving ? 'Creando...' : 'Crear Acceso'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900/80 border border-border rounded-xl p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'active', label: 'Activos' },
            { value: 'inactive', label: 'Inactivos' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-slate-900/80 text-white'
                  : 'bg-card text-muted-foreground hover:text-white hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grants Table */}
      <div className="bg-slate-900/80 border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Super Admin</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Empresa</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Nivel</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Motivo</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Fecha</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td colSpan={7} className="px-6 py-4">
                    <div className="h-4 bg-card rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <KeyRound className="w-12 h-12 text-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No hay accesos registrados</p>
                </td>
              </tr>
            ) : (
              filtered.map((grant) => (
                <tr key={grant.id} className="border-b border-border/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{grant.super_admin_name}</p>
                        <p className="text-xs text-muted-foreground">{grant.super_admin_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      {grant.company_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      grant.access_level === 'full' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {grant.access_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{grant.reason || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      grant.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-muted0/10 text-muted-foreground border border-border/20'
                    }`}>
                      {grant.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {grant.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-muted-foreground">
                      {new Date(grant.created_at).toLocaleDateString('es-CL')}
                      {grant.expires_at && (
                        <p className="text-violet-400 mt-0.5">Exp: {new Date(grant.expires_at).toLocaleDateString('es-CL')}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {grant.is_active && (
                      <button
                        onClick={() => handleRevoke(grant.id)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-xs font-medium text-rose-400 transition-colors"
                      >
                        Revocar
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
