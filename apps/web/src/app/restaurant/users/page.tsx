'use client';

import { useState } from 'react';
import { Users, Shield, KeyRound, UserPlus, Power, Pencil, Trash, RotateCcw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import RoleProtected from '../components/role-protected';
import {
  INITIAL_RESTAURANT_USERS,
  RestaurantUser,
  RestaurantRole,
  ROLE_PERMISSIONS,
  ROLE_LABELS,
  ROLE_BADGES,
} from '../lib/restaurant-store';
import { useRestaurantRole } from '../lib/role-context';

export default function RestaurantUsersPage() {
  const { users, addUser, updateUser, removeUser, canAccess } = useRestaurantRole();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'waiter' as RestaurantRole,
    pin: '',
  });

  if (!canAccess('users')) {
    return <RoleProtected section="users"><div /></RoleProtected>;
  }

  const formatCLP = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.pin) {
      toast.error('Complete nombre, email y PIN.');
      return;
    }
    const created: RestaurantUser = {
      id: `usr-${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role,
      pin: form.pin,
      active: true,
    };
    addUser(created);
    toast.success(`Usuario "${form.name}" creado como ${ROLE_LABELS[form.role]}.`);
    setForm({ name: '', email: '', role: 'waiter', pin: '' });
    setShowAdd(false);
  };

  const toggleActive = (user: RestaurantUser) => {
    updateUser(user.id, { active: !user.active });
    toast.success(user.active ? `Usuario "${user.name}" desactivado.` : `Usuario "${user.name}" reactivado.`);
  };

  const handleDelete = (user: RestaurantUser) => {
    removeUser(user.id);
    toast.success(`Usuario "${user.name}" eliminado.`);
  };

  const sectionLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    pos: 'POS Garzón',
    kiosk: 'Kiosco QR',
    kitchen: 'KDS Cocina',
    bar: 'KDS Bar',
    sales: 'Boletas SII',
    reservations: 'Reservas',
    cashier: 'Cierre Caja',
    reports: 'Reportes',
    users: 'Usuarios',
    admin: 'Admin Menú',
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Usuarios & Control de Roles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de personal del restaurante: garzones, cajeros, cocina, bar y administración.
            Cada rol accede únicamente a las secciones que el control de permisos permite.
          </p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2 self-start"
        >
          <UserPlus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Registrar Personal</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre completo"
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@erp.cl"
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value })}
              placeholder="PIN (4 dígitos)"
              maxLength={4}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as RestaurantRole })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              {ROLE_PERMISSIONS.map((p) => (
                <option key={p.role} value={p.role}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Crear Usuario
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-slate-700 px-4 py-2 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Personal del Establecimiento ({users.length})</h3>
          <span className="text-xs text-slate-400">Cambie de usuario desde la barra lateral para probar el control de acceso</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-semibold">Usuario</th>
                <th className="px-5 py-3 font-semibold">Rol</th>
                <th className="px-5 py-3 font-semibold">PIN</th>
                <th className="px-5 py-3 font-semibold">Último Acceso</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-black">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${ROLE_BADGES[user.role]}`}>
                      <Shield className="w-3 h-3" /> {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-slate-500 font-mono">
                      <KeyRound className="w-3.5 h-3.5" /> {user.pin}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{user.lastLogin || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${user.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <span className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActive(user)}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title={user.active ? 'Desactivar' : 'Reactivar'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission matrix */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" /> Matriz de Permisos por Rol
          </h3>
          <p className="text-xs text-slate-500 mt-1">Qué sección ve cada rol del restaurante.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-semibold">Rol</th>
                {Object.keys(sectionLabels).map((s) => (
                  <th key={s} className="px-2 py-3 font-semibold text-center">{sectionLabels[s]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROLE_PERMISSIONS.map((perm) => (
                <tr key={perm.role} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${ROLE_BADGES[perm.role]}`}>
                      <Shield className="w-3 h-3" /> {perm.label}
                    </span>
                  </td>
                  {Object.keys(sectionLabels).map((s) => {
                    const allowed = perm.sections[s as keyof typeof perm.sections];
                    return (
                      <td key={s} className="px-2 py-3 text-center">
                        {allowed ? (
                          <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                            <RotateCcw className="w-3 h-3 opacity-0" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
