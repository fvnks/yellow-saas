'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Users, Calendar, Shield, AlertTriangle, CheckCircle, Clock, LogIn, Download, Package } from 'lucide-react';

interface ModuleActivation {
  id: string;
  module_name: string;
  catalog_name: string;
  catalog_description: string;
  activated_by: string;
  activated_at: string;
  status: string;
}

interface ModuleCatalog {
  id: string;
  name: string;
  label: string;
  description: string;
}

interface CompanyDetail {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  created_at: string;
  trial_ends_at: string;
  users: { id: string; email: string; full_name: string; role: string; status: string; created_at: string }[];
  grants: { id: string; super_admin_name: string; super_admin_email: string; access_level: string; reason: string; is_active: boolean; created_at: string }[];
  modules: ModuleActivation[];
  module_catalog: ModuleCatalog[];
}

export default function AdminCompanyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      const res = await fetch(`/api/super-admin/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCompany(data.data);
      } else {
        setError(data.error?.message || 'Error al cargar empresa');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirm('¿Estás seguro de suspender esta empresa?')) return;
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      await fetch(`/api/super-admin/companies/${id}/suspend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: company?.status === 'suspended' ? 'activate' : 'suspend' }),
      });
      fetchCompany();
    } catch (err) {
      console.error('Failed to toggle company status:', err);
    }
  };

  const handleLoginAs = async (userId: string) => {
    if (!confirm('¿Ingresar como este usuario? Serás redirigido al dashboard de la empresa.')) return;
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      const res = await fetch('/api/super-admin/login-as', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: id, user_id: userId }),
      });
      const data = await res.json();
      if (data.success) {
        document.cookie = `auth-token=${data.data.token}; path=/; max-age=${4 * 60 * 60}`;
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Failed to login as user:', err);
    }
  };

  const handleExport = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      const res = await fetch('/api/super-admin/export?type=companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const csv = [
          Object.keys(data.data.data[0] || {}).join(','),
          ...data.data.data.map((row: Record<string, unknown>) => Object.values(row).join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `empresas_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (err) {
      console.error('Failed to export:', err);
    }
  };

  const handleToggleModule = async (moduleName: string, isActive: boolean) => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      await fetch(`/api/super-admin/companies/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isActive ? 'activate' : 'deactivate', module_name: moduleName }),
      });
      fetchCompany();
    } catch (err) {
      console.error('Failed to toggle module:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-violet-400 mx-auto mb-4" />
        <p className="text-muted-foreground">{error || 'Empresa no encontrada'}</p>
        <Link href="/admin/companies" className="text-violet-400 hover:text-violet-400 text-sm mt-4 inline-block">
          Volver a empresas
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    trial: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    suspended: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    cancelled: 'bg-muted0/10 text-muted-foreground border-border/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/companies" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{company.name}</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusColors[company.status] || statusColors.active}`}>
              {company.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">ID: {company.id}</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-muted hover:bg-muted rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
        <button
          onClick={handleSuspend}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            company.status === 'suspended'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          {company.status === 'suspended' ? 'Activar' : 'Suspender'}
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 border border-violet-500/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Plan</p>
              <p className="text-lg font-bold text-white capitalize">{company.plan}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/80 border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Usuarios</p>
              <p className="text-lg font-bold text-white">{company.users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/80 border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Creada</p>
              <p className="text-sm font-bold text-white">{new Date(company.created_at).toLocaleDateString('es-CL')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="bg-slate-900/80 border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Módulos Activados ({company.modules.length})</h3>
          <Package className="w-4 h-4 text-muted-foreground" />
        </div>
        {company.module_catalog.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No hay módulos disponibles en el catálogo
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {company.module_catalog.map((mod) => {
                const isActive = company.modules.some(m => m.module_name === mod.name);
                return (
                  <div
                    key={mod.name}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-card/50 border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-emerald-500/20' : 'bg-muted/50'
                      }`}>
                        <Package className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{mod.label}</p>
                        <p className="text-xs text-muted-foreground">{mod.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleModule(mod.name, !isActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Users */}
      <div className="bg-slate-900/80 border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-white">Usuarios ({company.users.length})</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Usuario</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Rol</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Creado</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {company.users.map((user) => (
              <tr key={user.id} className="border-b border-border/50 hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-white">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-muted0/10 text-muted-foreground border border-border/20">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-muted0/10 text-muted-foreground border border-border/20'
                  }`}>
                    {user.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString('es-CL')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleLoginAs(user.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/20 border border-violet-500/20 rounded-lg text-xs font-medium text-violet-400 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Ingresar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Access Grants */}
      <div className="bg-slate-900/80 border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-white">Accesos de Super Admin ({company.grants.length})</h3>
        </div>
        {company.grants.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No hay accesos de super admin registrados
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Super Admin</th>
                <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Nivel</th>
                <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Motivo</th>
                <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {company.grants.map((grant) => (
                <tr key={grant.id} className="border-b border-border/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">{grant.super_admin_name}</p>
                      <p className="text-xs text-muted-foreground">{grant.super_admin_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-violet-400 border border-violet-500/20">
                      {grant.access_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{grant.reason || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      grant.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-muted0/10 text-muted-foreground border border-border/20'
                    }`}>
                      {grant.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(grant.created_at).toLocaleDateString('es-CL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
