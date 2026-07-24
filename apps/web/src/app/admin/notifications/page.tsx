'use client';

import { useEffect, useState } from 'react';
import { Bell, Send, Building2, CheckCircle, AlertTriangle, Info, AlertCircle, Plus, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  company_name: string | null;
  company_id: string | null;
}

interface Company {
  id: string;
  name: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ company_id: '', title: '', message: '', type: 'info' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchNotifications();
    fetchCompanies();
  }, []);

  const getToken = () => document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/super-admin/notifications', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setNotifications(data.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
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
      const res = await fetch('/api/super-admin/notifications', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form.company_id ? form : { title: form.title, message: form.message, type: form.type }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Notificación enviada correctamente' });
        setForm({ company_id: '', title: '', message: '', type: 'info' });
        setShowCreate(false);
        fetchNotifications();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Error al enviar' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const typeIcons: Record<string, typeof Info> = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: AlertCircle,
  };

  const typeColors: Record<string, string> = {
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
          <p className="text-sm text-slate-400 mt-1">Envía notificaciones a empresas de la plataforma</p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setMessage({ type: '', text: '' }); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showCreate ? 'Cancelar' : 'Nueva Notificación'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Enviar Notificación</h3>
          {message.text && (
            <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {message.text}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Enviar a</label>
                <select
                  value={form.company_id}
                  onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Todas las empresas</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="info">Info</option>
                  <option value="warning">Advertencia</option>
                  <option value="success">Éxito</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Título</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Título de la notificación"
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Mensaje</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Contenido de la notificación..."
                required
                rows={3}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {saving ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Título</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Mensaje</th>
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
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No hay notificaciones</p>
                </td>
              </tr>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcons[n.type] || Info;
                return (
                  <tr key={n.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(n.created_at).toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${typeColors[n.type] || typeColors.info}`}>
                        <Icon className="w-3 h-3" />
                        {n.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">{n.title}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {n.company_name || 'Todas'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-[250px] truncate">{n.message}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
