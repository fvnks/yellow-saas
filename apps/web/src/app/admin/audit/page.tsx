'use client';

import { useEffect, useState } from 'react';
import { ScrollText, Search, Shield, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  super_admin_name: string;
  super_admin_email: string;
  company_name: string;
}

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchEntries();
  }, [page]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      const res = await fetch(`/api/super-admin/audit?limit=${limit}&offset=${page * limit}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const actionColors: Record<string, string> = {
    login: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    access: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    modify: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    logout: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-sm text-slate-400 mt-1">Registro de acciones de super admins en la plataforma</p>
      </div>

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
