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

export default function RolesTab() {
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
    const api = getApiClient();
    Promise.all([api.getRoles(), api.getPermissions()])
      .then(([r, p]) => {
        setRoles(Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : []);
        setAllPermissions(Array.isArray(p) ? p : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    setSaving(true);
    try {
      const api = getApiClient();
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
      const api = getApiClient();
      await api.updateRolePermissions(editingRole.id, selectedPerms);
      setEditingRole(null);
      setSelectedPerms([]);
      loadRoles();
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Eliminar este rol?')) return;
    const api = getApiClient();
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
              {roles.map(role => (
                <tr key={role.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm font-medium text-slate-900">{role.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-500 max-w-[200px] truncate">{role.description || '—'}</td>
                  <td className="px-6 py-3">
                    <Badge variant={role.is_system ? 'info' : 'neutral'}>{role.is_system ? 'Sistema' : 'Personalizado'}</Badge>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">{role.permissions?.length || 0} permisos</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="Editar permisos"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {!role.is_system && (
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Eliminar rol"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400">No hay roles personalizados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in-0">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in-0">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Permisos para: {editingRole.name}</h3>
              <button onClick={() => { setEditingRole(null); setSelectedPerms([]); }} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(groupedPerms).map(([module, perms]) => (
                <div key={module} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900 capitalize">{MODULE_LABELS[module] || module}</h4>
                    <button
                      onClick={() => toggleModule(module)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {perms.every(p => selectedPerms.includes(p.id)) ? 'Deseleccionar todo' : 'Seleccionar todo'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {perms.map(perm => (
                      <label key={perm.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${selectedPerms.includes(perm.id) ? ACTION_COLORS[perm.action] : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <input type="checkbox" checked={selectedPerms.includes(perm.id)} onChange={() => togglePerm(perm.id)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                        <span className="text-xs font-medium capitalize">{ACTION_LABELS[perm.action]}</span>
                        <Badge variant={(perm.action === 'create' ? 'success' : perm.action === 'read' ? 'info' : perm.action === 'update' ? 'warning' : 'danger') as 'success' | 'info' | 'warning' | 'danger'} className="text-[9px]">{perm.description}</Badge>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setEditingRole(null); setSelectedPerms([]); }}>Cancelar</Button>
              <Button onClick={handleSavePermissions} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Permisos'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showNewRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in-0">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95 fade-in-0">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Nuevo Rol</h3>
              <button onClick={() => setShowNewRole(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Nombre del Rol" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="Ej: Supervisor Ventas" required />
              <Input label="Descripcion" value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} placeholder="Descripcion opcional" />
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={() => { setShowNewRole(false); setNewRoleName(''); setNewRoleDesc(''); }}>Cancelar</Button>
                <Button onClick={handleCreateRole} disabled={saving || !newRoleName.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  {saving ? 'Creando...' : 'Crear Rol'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}