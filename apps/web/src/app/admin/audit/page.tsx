'use client';

import { useEffect, useState } from 'react';
import { ScrollText, Search, Shield, Building2, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  super_admin_name: string;
  super_admin_email: string;
  super_admin_id: string;
  company_name: string;
  company_id: string;
}

interface SuperAdmin {
  id: string;
  name: string;
  email: string;
}

interface Company {
  id: string;
  name: string;
}

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const limit = 50;

  const [filters, setFilters] = useState({ action: '', super_admin_id: '', company_id: '', date_from: '', date_to: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEntries();
    fetchSuperAdmins();
    fetchCompanies();
  }, [page, filters]);

  const getToken = () => document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1] || '';

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
      if (filters.action) params.set('action', filters.action);
      if (filters.super_admin_id) params.set('super_admin_id', filters.super_admin_id);
      if (filters.company_id) params.set('company_id', filters.company_id);
      if (filters.date_from) params.set('date_from', filters.date_from);
      if (filters.date_to) params.set('date_to', filters.date_to);

      const res = await fetch(`/api/super-admin/audit?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setEntries(data.data.entries);
        setTotal(data.data.total);
      }
    } catch (err) {
      console.error('Failed to load audit log:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuperAdmins = async () => {
    try {
      const res = await fetch('/api/super-admin/super-admins', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setSuperAdmins(data.data);
    } catch (err) {
      console.error('Failed to load super admins:', err);
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

  const activeFilters = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ action: '', super_admin_id: '', company_id: '', date_from: '', date_to: '' });
    setPage(0);
  };

  const actionColors: Record<string, string> = {
    login: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    access: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    modify: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    logout: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-sm text-slate-400 mt-1">Registro de acciones de super admins en la plataforma</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showFilters || activeFilters > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros {activeFilters > 0 && `(${activeFilters})`}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Acción</label>
              <select
                value={filters.action}
                onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(0); }}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Todas</option>
                <option value="login">Login</option>
                <option value="access">Access</option>
                <option value="modify">Modify</option>
                <option value="logout">Logout</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Super Admin</label>
              <select
                value={filters.super_admin_id}
                onChange={(e) => { setFilters({ ...filters, super_admin_id: e.target.value }); setPage(0); }}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Todos</option>
                {superAdmins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Empresa</label>
              <select
                value={filters.company_id}
                onChange={(e) => { setFilters({ ...filters, company_id: e.target.value }); setPage(0); }}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Todas</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Desde</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => { setFilters({ ...filters, date_from: e.target.value }); setPage(0); }}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Hasta</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => { setFilters({ ...filters, date_to: e.target.value }); setPage(0); }}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          {activeFilters > 0 && (
            <div className="mt-3 flex justify-end">
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                <X className="w-3 h-3" /> Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Super Admin</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Acción</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td colSpan={5} className="px-6 py-4">
                    <div className="h-4 bg-slate-800 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <ScrollText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No hay registros de auditoría</p>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(entry.created_at).toLocaleString('es-CL')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{entry.super_admin_name}</p>
                        <p className="text-[10px] text-slate-500">{entry.super_admin_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      {entry.company_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${actionColors[entry.action] || actionColors.access}`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 max-w-[200px] truncate">
                    {entry.details ? JSON.stringify(entry.details) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <p>Mostrando {page * limit + 1}-{Math.min((page + 1) * limit, total)} de {total}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
