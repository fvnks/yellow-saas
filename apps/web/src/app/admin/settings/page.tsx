'use client';

import { useEffect, useState } from 'react';
import { Settings, Shield, Save, AlertCircle, CheckCircle, Database, Globe, Key, Pencil, Trash2, X } from 'lucide-react';

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

  const [editAdmin, setEditAdmin] = useState<SuperAdmin | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', is_active: true });
  const [editSaving, setEditSaving] = useState(false);

  const [deleteAdmin, setDeleteAdmin] = useState<SuperAdmin | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const getToken = () => document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1] || '';

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/super-admin/super-admins', {
        headers: { Authorization: `Bearer ${getToken()}` },
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
      const res = await fetch('/api/super-admin/super-admins', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
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

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdmin) return;
    setEditSaving(true);

    try {
      const body: any = { name: editForm.name, email: editForm.email, is_active: editForm.is_active };
      if (editForm.password) body.password = editForm.password;

      const res = await fetch(`/api/super-admin/super-admins/${editAdmin.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setEditAdmin(null);
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Error al actualizar' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAdmin) return;
    setDeleteSaving(true);

    try {
      const res = await fetch(`/api/super-admin/super-admins/${deleteAdmin.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();

      if (data.success) {
        setDeleteAdmin(null);
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Error al eliminar' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setDeleteSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona super administradores de la plataforma</p>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Base de datos</p>
              <p className="text-sm font-medium text-white">PostgreSQL</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/80 border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Plataforma</p>
              <p className="text-sm font-medium text-white">Yellow ERP</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/80 border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Super Admins</p>
              <p className="text-sm font-medium text-white">{admins.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Super Admins Section */}
      <div className="bg-slate-900/80 border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Super Administradores</h3>
          <button
            onClick={() => { setShowCreate(!showCreate); setMessage({ type: '', text: '' }); }}
            className="px-4 py-2 bg-slate-900/80 hover:bg-slate-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            {showCreate ? 'Cancelar' : 'Crear Super Admin'}
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="px-6 py-4 border-b border-border bg-card/30">
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@yellow.cl"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2 bg-slate-900/80 hover:bg-slate-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
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
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Admin</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Último Acceso</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Creado</th>
              <th className="text-right px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td colSpan={5} className="px-6 py-4">
                    <div className="h-4 bg-card rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No hay super admins registrados
                </td>
              </tr>
            ) : (
              admins.map((adm) => (
                <tr key={adm.id} className="border-b border-border/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{adm.name}</p>
                        <p className="text-xs text-muted-foreground">{adm.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      adm.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-muted0/10 text-muted-foreground border-border/20'
                    }`}>
                      {adm.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {adm.last_login_at ? new Date(adm.last_login_at).toLocaleString('es-CL') : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(adm.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditAdmin(adm);
                          setEditForm({ name: adm.name, email: adm.email, password: '', is_active: adm.is_active });
                          setMessage({ type: '', text: '' });
                        }}
                        className="p-1.5 text-muted-foreground hover:text-amber-400 hover:bg-slate-700/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setDeleteAdmin(adm); setMessage({ type: '', text: '' }); }}
                        className="p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Eliminar"
                        disabled={adm.id === admins[0]?.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editAdmin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900/80 border border-border rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Editar Super Admin</h2>
              <button onClick={() => setEditAdmin(null)} className="text-muted-foreground hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nueva contraseña (opcional)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Dejar vacío para no cambiar"
                  minLength={8}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-muted-foreground">Estado</label>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    editForm.is_active ? 'bg-slate-900/80' : 'bg-muted'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-card transition-transform ${
                    editForm.is_active ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`} />
                </button>
                <span className="text-xs text-muted-foreground">{editForm.is_active ? 'Activo' : 'Inactivo'}</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditAdmin(null)}
                  className="px-4 py-2 bg-card hover:bg-slate-700 rounded-lg text-sm font-medium text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-4 py-2 bg-slate-900/80 hover:bg-slate-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                >
                  {editSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteAdmin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900/80 border border-border rounded-xl shadow-xl w-full max-w-sm mx-4">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Eliminar Super Admin</h2>
              <button onClick={() => setDeleteAdmin(null)} className="text-muted-foreground hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-foreground">
                ¿Estás seguro de eliminar a <span className="font-semibold text-white">{deleteAdmin.name}</span>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setDeleteAdmin(null)}
                className="px-4 py-2 bg-card hover:bg-slate-700 rounded-lg text-sm font-medium text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteSaving}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              >
                {deleteSaving ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
