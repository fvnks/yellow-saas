'use client';

import React, { useState } from 'react';
import { Key, Plus, Copy, CheckCircle2, ExternalLink, Trash2, Loader2, Search } from 'lucide-react';
import { usePortalTokens } from '@/app/veterinaria/hooks/use-portal-tokens';
import { usePatients } from '@/app/veterinaria/hooks/use-patients';
import { useClients } from '@/app/veterinaria/hooks/use-clients';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function PortalTokensPage() {
  const { data: tokens, loading, refresh } = usePortalTokens();
  const { data: patients } = usePatients();
  const { data: clients } = useClients();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ patientId: '', clientId: '' });

  const filtered = tokens.filter((t: any) =>
    !search || t.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.token?.includes(search)
  );

  const getPortalUrl = (token: string) => `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/vet/${token}`;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.clientId) return;
    setSaving(true);
    try {
      const api = getApiClient();
      await api.createVetPortalToken({ patient_id: formData.patientId, client_id: formData.clientId });
      await refresh();
      setShowModal(false);
      setFormData({ patientId: '', clientId: '' });
      toast.success('Token generado — el tutor puede acceder con el enlace');
    } catch (err: any) {
      toast.error(err.message || 'Error al crear token');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (token: string, id: string) => {
    navigator.clipboard.writeText(getPortalUrl(token));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este token? El tutor ya no podrá acceder.')) return;
    try {
      const api = getApiClient();
      await api.deleteVetPortalToken(id);
      await refresh();
      toast.success('Token eliminado');
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Key className="w-7 h-7 text-amber-600" />
            Portal de Tutores
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Genera enlaces únicos para que los tutores revisen el estado de su mascota.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Generar Token
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por paciente, tutor o token..." className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Paciente / Tutor</th>
                  <th className="px-6 py-3.5">Token</th>
                  <th className="px-6 py-3.5">Último Acceso</th>
                  <th className="px-6 py-3.5">Visitas</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-xs">{t.patient_name}</div>
                      <div className="text-[11px] text-slate-500">{t.client_name} • {t.species}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">{t.token?.slice(0, 16)}...</code>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">{t.last_accessed_at ? new Date(t.last_accessed_at).toLocaleString('es-CL') : 'Nunca'}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-900">{t.access_count || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${t.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        {t.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleCopy(t.token, t.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all" title="Copiar enlace">
                          {copiedId === t.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a href={getPortalUrl(t.token)} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all" title="Abrir portal">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Generar Token de Acceso</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mascota *</label>
                <select value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Seleccionar mascota...</option>
                  {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tutor *</label>
                <select value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Seleccionar tutor...</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.fullName} ({c.rut})</option>)}
                </select>
              </div>
              <p className="text-xs text-slate-500">El tutor recibirá un enlace único para consultar el historial clínico, citas y tratamientos de su mascota.</p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800">Cancelar</button>
                <button type="submit" disabled={saving} className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-sm disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Generar Enlace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
