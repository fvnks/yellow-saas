'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Search, Building2, Shield, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

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

export default function AdminGrantsPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      const res = await fetch('/api/super-admin/grants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setGrants(data.data);
    } catch (err) {
      console.error('Failed to load grants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (grantId: string) => {
    if (!confirm('¿Revocar este acceso?')) return;
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      await fetch(`/api/super-admin/grants/${grantId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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
      <div>
        <h1 className="text-2xl font-bold text-white">Accesos</h1>
        <p className="text-sm text-slate-400 mt-1">Gestiona los accesos de super admin a empresas</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
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
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grants Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Super Admin</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Nivel</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Motivo</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td colSpan={7} className="px-6 py-4">
                    <div className="h-4 bg-slate-800 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <KeyRound className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No hay accesos registrados</p>
                </td>
              </tr>
            ) : (
              filtered.map((grant) => (
                <tr key={grant.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{grant.super_admin_name}</p>
                        <p className="text-xs text-slate-500">{grant.super_admin_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      {grant.company_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      grant.access_level === 'full' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {grant.access_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{grant.reason || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      grant.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {grant.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {grant.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-400">
                      {new Date(grant.created_at).toLocaleDateString('es-CL')}
                      {grant.expires_at && (
                        <p className="text-amber-400 mt-0.5">Exp: {new Date(grant.expires_at).toLocaleDateString('es-CL')}</p>
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
