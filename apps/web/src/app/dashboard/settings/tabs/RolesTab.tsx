'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Input, Badge } from '@yellow-erp/ui';
import { Plus, Trash2, Save, X, Check, Pencil } from 'lucide-react';
import { getApiClient } from '../../../../lib/api-client';

interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions?: { id: string; module: string; action: string; description: string }[];
}

interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

const MODULE_LABELS: Record<string, string> = {
  inventory: 'Inventario', warehouses: 'Bodegas', sales_orders: 'Ordenes de Venta',
  delivery_guides: 'Guias de Despacho', invoices: 'Facturacion', pos: 'Punto de Venta',
  purchase_orders: 'Ordenes de Compra', quotations: 'Cotizaciones', customers: 'Clientes',
  suppliers: 'Proveedores', crm: 'CRM', price_lists: 'Listas de Precio',
  payroll: 'Nomina', accounting: 'Contabilidad', projects: 'Proyectos',
  reports: 'Reportes', audit: 'Auditoria', settings: 'Configuracion',
  users: 'Usuarios', roles: 'Roles',
};

const ACTION_LABELS: Record<string, string> = { create: 'Crear', read: 'Ver', update: 'Editar', delete: 'Eliminar' };
const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  read: 'bg-blue-50 text-blue-700 border-blue-200',
  update: 'bg-amber-50 text-amber-700 border-amber-200',
  delete: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function RolesTab({ companyId = 'demo-company-id' }: { companyId?: string }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const loadRoles = useCallback(() => {
    const api = getApiClient(companyId);
    Promise.all([api.getRoles(), api.getPermissions()])
      .then(([r, p]) => {
        setRoles(Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : []);
        setAllPermissions(Array.isArray(p) ? p : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    setSaving(true);
    try {
      const api = getApiClient(companyId);
      await api.createRole({ name: newRoleName, description: newRoleDesc });
      setNewRoleName('');
      setNewRoleDesc('');
      setShowNewRole(false);
      loadRoles();
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setSelectedPerms(role.permissions?.map(p => p.id) || []);
  };

  const handleSavePermissions = async () => {
    if (!editingRole) return;
    setSaving(true);
    try {
      const api = getApiClient(companyId);
      await api.updateRolePermissions(editingRole.id, selectedPerms);
      setEditingRole(null);
      setSelectedPerms([]);
      loadRoles();
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Eliminar este rol?')) return;
    const api = getApiClient(companyId);
    await api.deleteRole(roleId);
    loadRoles();
  };

  const togglePerm = (permId: string) => {
    setSelectedPerms(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const toggleModule = (module: string) => {
    const modulePerms = allPermissions.filter(p => p.module === module).map(p => p.id);
    const allSelected = modulePerms.every(id => selectedPerms.includes(id));
    if (allSelected) {
      setSelectedPerms(prev => prev.filter(id => !modulePerms.includes(id)));
    } else {
      setSelectedPerms(prev => [...new Set([...prev, ...modulePerms])]);
    }
  };

  const groupedPerms = allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  if (loading) {
    return <div className="animate-pulse bg-slate-200 h-32 rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Roles Personalizados</h3>
          <button
            onClick={() => setShowNewRole(true)}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo Rol
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                {['Nombre', 'Descripcion', 'Tipo', 'Permisos', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-xs font-medium text-slate-900">{role.name}</td>
                  <td className="px-6 py-3 text-xs text-slate-500">{role.description || '—'}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${role.is_system ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {role.is_system ? 'Sistema' : 'Personalizado'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-slate-600">{role.permissions?.length || 0}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEditRole(role)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {!role.is_system && (
                        <button onClick={() => handleDeleteRole(role.id)} className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-500">No hay roles creados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewRole && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Nuevo Rol</h3>
            <button onClick={() => setShowNewRole(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Nombre del Rol</label>
              <input type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="Ej: Vendedor"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Descripcion</label>
              <input type="text" value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} placeholder="Describe las funciones de este rol"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNewRole(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleCreateRole} disabled={saving} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">{saving ? 'Creando...' : 'Crear Rol'}</button>
            </div>
          </div>
        </div>
      )}

      {editingRole && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Permisos: {editingRole.name}</h3>
            <button onClick={() => setEditingRole(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500">Selecciona los modulos y acciones que este rol puede realizar.</p>
            <div className="space-y-4">
              {Object.entries(groupedPerms).map(([module, perms]) => {
                const modulePerms = perms.map(p => p.id);
                const allSelected = modulePerms.every(id => selectedPerms.includes(id));
                const someSelected = modulePerms.some(id => selectedPerms.includes(id));
                return (
                  <div key={module} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <input type="checkbox" checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                        onChange={() => toggleModule(module)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      <span className="text-sm font-semibold text-slate-900">{MODULE_LABELS[module] || module}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-7">
                      {perms.map((perm) => (
                        <button key={perm.id} onClick={() => togglePerm(perm.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            selectedPerms.includes(perm.id) ? ACTION_COLORS[perm.action] : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}>
                          {selectedPerms.includes(perm.id) && <Check className="w-3 h-3" />}
                          {ACTION_LABELS[perm.action]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button onClick={() => setEditingRole(null)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSavePermissions} disabled={saving} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Permisos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
