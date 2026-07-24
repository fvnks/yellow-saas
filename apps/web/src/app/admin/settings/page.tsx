'use client';

import { useEffect, useState } from 'react';
import { Settings, Shield, Save, AlertCircle, CheckCircle, Database, Globe, Key } from 'lucide-react';

interface SuperAdmin {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export default function AdminSettingsPage() {
  const [admins, setAdmins] = useState<SuperAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      const res = await fetch('/api/super-admin/super-admins', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAdmins(data.data);
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      const res = await fetch('/api/super-admin/super-admins', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Super admin creado correctamente' });
        setForm({ email: '', name: '', password: '' });
        setShowCreate(false);
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Error al crear' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-sm text-slate-400 mt-1">Gestiona super administradores de la plataforma</p>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base de datos</p>
              <p className="text-sm font-medium text-white">PostgreSQL</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plataforma</p>
              <p className="text-sm font-medium text-white">Yellow ERP</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Super Admins</p>
              <p className="text-sm font-medium text-white">{admins.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Super Admins Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Super Administradores</h3>
          <button
            onClick={() => { setShowCreate(!showCreate); setMessage({ type: '', text: '' }); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            {showCreate ? 'Cancelar' : 'Crear Super Admin'}
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30">
            {message.text && (
              <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@yellow.cl"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Admin</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Último Acceso</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Creado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td colSpan={4} className="px-6 py-4">
                    <div className="h-4 bg-slate-800 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                  No hay super admins registrados
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{admin.name}</p>
                        <p className="text-xs text-slate-500">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      admin.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {admin.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {admin.last_login_at ? new Date(admin.last_login_at).toLocaleString('es-CL') : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(admin.created_at).toLocaleDateString('es-CL')}
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
