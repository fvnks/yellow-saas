'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface Member {
  id: string;
  user_id: string;
  user_name: string;
  email: string;
  avatar_url: string;
  role: string;
  created_at: string;
}

interface ProjectMembersProps {
  projectId: string;
  users: any[];
}

const roleConfig: Record<string, { label: string; color: string }> = {
  owner: { label: 'Propietario', color: 'bg-blue-50 text-primary border-primary/20' },
  admin: { label: 'Admin', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  member: { label: 'Miembro', color: 'bg-muted text-foreground border-border' },
  viewer: { label: 'Visor', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function ProjectMembers({ projectId, users }: ProjectMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');

  useEffect(() => { loadMembers(); }, [projectId]);

  const loadMembers = async () => {
    try {
      const api = getApiClient();
      const res = await api.getProjectMembers(projectId);
      setMembers(Array.isArray(res) ? res : []);
    } catch {} finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!selectedUser) return;
    try {
      const api = getApiClient();
      await api.addProjectMember(projectId, { user_id: selectedUser, role: selectedRole });
      setSelectedUser('');
      setShowAdd(false);
      loadMembers();
      toast.success('Miembro agregado');
    } catch { toast.error('Error al agregar miembro'); }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remover este miembro?')) return;
    try {
      const api = getApiClient();
      await api.removeProjectMember(projectId, userId);
      loadMembers();
      toast.success('Miembro removido');
    } catch { toast.error('Error al remover'); }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const api = getApiClient();
      await api.addProjectMember(projectId, { user_id: userId, role: newRole });
      loadMembers();
    } catch { toast.error('Error al cambiar rol'); }
  };

  const availableUsers = users.filter(u => !members.some(m => m.user_id === u.id));

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Equipo del Proyecto</h3>
        <button onClick={() => setShowAdd(true)}
          className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Agregar
        </button>
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-border dark:bg-primary dark:border-border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Seleccionar usuario...</option>
              {availableUsers.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
            </select>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="viewer">Visor</option>
              <option value="member">Miembro</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-foreground hover:text-foreground">Cancelar</button>
            <button onClick={handleAdd} disabled={!selectedUser}
              className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
              Agregar
            </button>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="text-center py-8 bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
          <Users className="w-10 h-10 text-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Sin miembros asignados</p>
          <p className="text-[10px] text-muted-foreground mt-1">Agrega miembros para controlar acceso</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map(member => {
            const role = roleConfig[member.role] || roleConfig.member;
            return (
              <div key={member.id} className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-border dark:bg-primary dark:border-border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {member.user_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{member.user_name}</h4>
                      <p className="text-[10px] text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={member.role} onChange={e => handleRoleChange(member.user_id, e.target.value)}
                      className="bg-muted border border-border rounded px-2 py-1 text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20">
                      <option value="viewer">Visor</option>
                      <option value="member">Miembro</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Propietario</option>
                    </select>
                    <button onClick={() => handleRemove(member.user_id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-muted border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Permisos por Rol</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-foreground">
          <div><span className="font-semibold">Propietario:</span> Control total</div>
          <div><span className="font-semibold">Admin:</span> Editar, asignar, eliminar</div>
          <div><span className="font-semibold">Miembro:</span> Editar tareas propias</div>
          <div><span className="font-semibold">Visor:</span> Solo lectura</div>
        </div>
      </div>
    </div>
  );
}
