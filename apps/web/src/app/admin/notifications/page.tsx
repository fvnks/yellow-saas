'use client';

import { useEffect, useState } from 'react';
import { Bell, Send, Building2, CheckCircle, AlertTriangle, Info, AlertCircle, Plus, X, Eye, EyeOff, Trash2 } from 'lucide-react';

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
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

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

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    try {
      await fetch(`/api/super-admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: isRead }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: isRead } : n));
    } catch (err) {
      console.error('Failed to update notification:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    await Promise.all(unreadIds.map(id => handleMarkAsRead(id, true)));
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/super-admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envía notificaciones a empresas de la plataforma
            {unreadCount > 0 && <span className="ml-2 text-indigo-400">({unreadCount} sin leer)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
              Marcar todo como leído
            </button>
          )}
          <button
            onClick={() => { setShowCreate(!showCreate); setMessage({ type: '', text: '' }); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showCreate ? 'Cancelar' : 'Nueva Notificación'}
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="bg-primary border border-slate-800 rounded-xl p-6">
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
                <label className="text-xs font-medium text-muted-foreground">Enviar a</label>
                <select
                  value={form.company_id}
                  onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option value="">Todas las empresas</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option value="info">Info</option>
                  <option value="warning">Advertencia</option>
                  <option value="success">Éxito</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Título</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Título de la notificación"
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Mensaje</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Contenido de la notificación..."
                required
                rows={3}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
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

      {/* Filters */}
      <div className="bg-primary border border-slate-800 rounded-xl p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'unread', label: `Sin leer (${unreadCount})` },
            { value: 'read', label: 'Leídas' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-muted-foreground hover:text-white hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-primary border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Fecha</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Tipo</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Título</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Empresa</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Mensaje</th>
              <th className="text-right px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td colSpan={7} className="px-6 py-4">
                    <div className="h-4 bg-slate-800 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Bell className="w-12 h-12 text-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No hay notificaciones</p>
                </td>
              </tr>
            ) : (
              filtered.map((n) => {
                const Icon = typeIcons[n.type] || Info;
                return (
                  <tr key={n.id} className={`border-b border-slate-800/50 hover:bg-primary/90/30 transition-colors ${!n.is_read ? 'bg-indigo-500/5' : ''}`}>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleMarkAsRead(n.id, !n.is_read)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          n.is_read ? 'text-muted-foreground hover:text-slate-300' : 'text-indigo-400 hover:text-indigo-300'
                        }`}
                        title={n.is_read ? 'Marcar como no leído' : 'Marcar como leído'}
                      >
                        {n.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${typeColors[n.type] || typeColors.info}`}>
                        <Icon className="w-3 h-3" />
                        {n.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${n.is_read ? 'text-muted-foreground' : 'text-white'}`}>{n.title}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Building2 className="w-3 h-3 text-muted-foreground" />
                        {n.company_name || 'Todas'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground max-w-[250px] truncate">{n.message}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
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
