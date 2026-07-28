'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge } from '@yellow-erp/ui';
import { Settings, Building2, Users, CreditCard, Bell, Shield, Globe, Save, Plus, Trash2, Mail, Key, Database, ShieldCheck, Zap, Pencil, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';
import RolesTab from './tabs/RolesTab';
import SupportAccessTab from './tabs/SupportAccessTab';
import IntegrationsTab from './tabs/IntegrationsTab';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState({
    id: '', name: '', tax_id: '', razon_social: '', giro: '',
    email: '', phone: '', address: '', city: '', region: '', logo_url: '',
    plan: 'free', status: 'active', userRole: 'member',
  });

  useEffect(() => {
    // Get user role from JWT
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
    let userRole = 'member';
    let companyId = '';
    if (authCookie) {
      try {
        const token = authCookie.split('=')[1];
        const payload = JSON.parse(atob(token.split('.')[1]));
        userRole = payload.role || 'member';
        companyId = payload.company_id || '';
      } catch {}
    }

    const api = getApiClient();
    api.getCompany().then((data: any) => {
      setCompany({
        id: companyId || data.id || '',
        name: data.name || '', tax_id: data.tax_id || '', razon_social: data.razon_social || '',
        giro: data.giro || '', email: data.email || '', phone: data.phone || '',
        address: data.address || '', city: data.city || '', region: data.region || '',
        logo_url: data.logo_url || '', plan: data.plan || 'free', status: data.status || 'active',
        userRole,
      });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const api = getApiClient();
      await api.updateCompany(company);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'roles', label: 'Roles y Permisos', icon: ShieldCheck },
    { id: 'billing', label: 'Suscripción', icon: CreditCard },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'support-access', label: 'Acceso de Soporte', icon: Key },
    { id: 'integrations', label: 'Integraciones', icon: Globe },
    { id: 'webhooks', label: 'Webhooks', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-1">Administra la configuración de tu empresa</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}>
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {activeTab === 'company' && (
            <>
              <Card>
                <CardHeader><CardTitle>Datos de la Empresa</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nombre de la Empresa" value={company.name} onChange={(e) => setCompany(p => ({ ...p, name: e.target.value }))} />
                    <Input label="Razón Social" value={company.razon_social} onChange={(e) => setCompany(p => ({ ...p, razon_social: e.target.value }))} />
                    <Input label="RUT" value={company.tax_id} onChange={(e) => setCompany(p => ({ ...p, tax_id: e.target.value }))} />
                    <Input label="Giro" value={company.giro} onChange={(e) => setCompany(p => ({ ...p, giro: e.target.value }))} />
                    <Input label="Email Corporativo" type="email" value={company.email} onChange={(e) => setCompany(p => ({ ...p, email: e.target.value }))} />
                    <Input label="Teléfono" value={company.phone} onChange={(e) => setCompany(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <Input label="Dirección" value={company.address} onChange={(e) => setCompany(p => ({ ...p, address: e.target.value }))} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Ciudad" value={company.city} onChange={(e) => setCompany(p => ({ ...p, city: e.target.value }))} />
                    <Select label="Región" value={company.region} onChange={(e) => setCompany(p => ({ ...p, region: e.target.value }))} options={[
                      { value: '', label: 'Seleccionar...' },
                      { value: '13', label: 'Metropolitana de Santiago' },
                      { value: '1', label: 'Arica y Parinacota' }, { value: '2', label: 'Tarapacá' },
                      { value: '3', label: 'Antofagasta' }, { value: '4', label: 'Atacama' },
                      { value: '5', label: 'Coquimbo' }, { value: '6', label: 'Valparaíso' },
                      { value: '7', label: 'Región del Libertador' }, { value: '8', label: 'Biobío' },
                      { value: '9', label: 'La Araucanía' }, { value: '10', label: 'Los Ríos' },
                      { value: '11', label: 'Los Lagos' }, { value: '12', label: 'Aysén' },
                      { value: '14', label: 'Magallanes' }, { value: '15', label: 'Ñuble' },
                    ]} />
                  </div>
                </CardContent>
              </Card>
              <div className="flex items-center justify-end gap-3">
                {saved && <span className="text-sm text-emerald-600">Guardado correctamente</span>}
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </>
          )}

          {activeTab === 'roles' && <RolesTab />}

          {activeTab === 'users' && <UsersTab />}

          {activeTab === 'billing' && <BillingTab plan={company.plan} status={company.status} />}

          {activeTab === 'notifications' && <NotificationsTab />}

          {activeTab === 'security' && <SecurityTab />}

          {activeTab === 'support-access' && (
            <SupportAccessTab companyId={company.id || ''} userRole={company.userRole || 'member'} />
          )}

          {activeTab === 'integrations' && <IntegrationsTab />}

          {activeTab === 'webhooks' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Webhooks</CardTitle>
                <Button onClick={() => (window.location.href = '/dashboard/settings/webhooks')}>
                  <Zap className="w-4 h-4 mr-2" /> Gestionar Webhooks
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-slate-50"><CardContent className="p-6">
                    <Zap className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-900 text-center">Eventos en Tiempo Real</p>
                    <p className="text-sm text-slate-500 mt-1 text-center">Recibe notificaciones instantáneas de stock, ventas, compras y más</p>
                  </CardContent></Card>
                  <Card className="bg-slate-50"><CardContent className="p-6">
                    <Shield className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-900 text-center">Seguro y Confiable</p>
                    <p className="text-sm text-slate-500 mt-1 text-center">Firma HMAC, reintentos exponenciales y logs de entrega</p>
                  </CardContent></Card>
                  <Card className="bg-slate-50"><CardContent className="p-6">
                    <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-900 text-center">Fácil Integración</p>
                    <p className="text-sm text-slate-500 mt-1 text-center">JSON sobre HTTP/HTTPS, eventos tipados y documentados</p>
                  </CardContent></Card>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {['stock.changed', 'stock.low', 'stock.out', 'batch.expiring', 'batch.expired', 'return.created', 'return.approved', 'order.created', 'order.shipped', 'invoice.created', 'invoice.paid', 'invoice.overdue', 'purchase_order.created', 'purchase_order.received'].map((event, i) => (
                      <Badge key={i} variant="secondary" className="font-mono">{event}</Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => (window.location.href = '/dashboard/settings/webhooks')}>
                      <Zap className="w-4 h-4 mr-2" /> Ir a Configuración de Webhooks
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<{ name: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const loadUsers = async () => {
    try {
      const api = getApiClient();
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
    const api = getApiClient();
    api.getRoles().then((res: any) => {
      const rolesData = Array.isArray(res) ? res : (res?.data || []);
      setRoles(rolesData.map((r: any) => ({ name: r.name, label: r.label || r.name })));
    }).catch(() => {});
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setSaving(true);
    try {
      const api = getApiClient();
      await api.createUser({ email: inviteEmail, full_name: inviteName, role: inviteRole });
      setInviteEmail(''); setInviteName(''); setInviteRole('member'); setShowInvite(false);
      loadUsers();
    } catch { toast.error('Error al crear usuario'); }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const api = getApiClient();
      await api.updateUser({ id: editingUser.id, full_name: editingUser.full_name, role: editingUser.role });
      setEditingUser(null);
      loadUsers();
    } catch { toast.error('Error al actualizar usuario'); }
    setSaving(false);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      const api = getApiClient();
      await api.deleteUser(userId);
      loadUsers();
    } catch { toast.error('Error al eliminar usuario'); }
  };

  const roleLabels: Record<string, string> = { owner: 'Propietario', admin: 'Administrador', manager: 'Gerente', member: 'Miembro', viewer: 'Observador' };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Usuarios del Sistema</CardTitle>
        <Button size="sm" onClick={() => setShowInvite(true)}>
          <Plus className="w-4 h-4 mr-2" /> Invitar Usuario
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {showInvite && (
          <div className="p-4 bg-indigo-50 border-b border-indigo-100 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="usuario@empresa.cl" />
              <Input label="Nombre" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Nombre completo" />
              <Select label="Rol" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                options={roles.length > 0
                  ? roles.filter(r => r.name !== 'owner').map(r => ({ value: r.name, label: r.label }))
                  : [
                      { value: 'member', label: 'Miembro' },
                      { value: 'admin', label: 'Administrador' },
                      { value: 'manager', label: 'Gerente' },
                      { value: 'viewer', label: 'Observador' },
                    ]
                } />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowInvite(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleInvite} disabled={saving || !inviteEmail}>
                <Check className="w-4 h-4 mr-1" /> {saving ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Último Acceso</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">No hay usuarios</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.full_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'owner' ? 'info' : user.role === 'admin' ? 'warning' : 'neutral'}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status === 'active' ? 'success' : user.status === 'invited' ? 'warning' : 'danger'}>
                      {user.status === 'active' ? 'Activo' : user.status === 'invited' ? 'Invitado' : 'Suspendido'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('es-CL') : 'Nunca'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {user.role !== 'owner' && (
                        <>
                          <button onClick={() => setEditingUser(user)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingUser && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <h4 className="text-sm font-medium text-slate-900">Editar Usuario</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Nombre" value={editingUser.full_name || ''} onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })} />
              <Select label="Rol" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                options={roles.length > 0
                  ? roles.map(r => ({ value: r.name, label: r.label }))
                  : [
                      { value: 'admin', label: 'Administrador' },
                      { value: 'manager', label: 'Gerente' },
                      { value: 'member', label: 'Miembro' },
                      { value: 'viewer', label: 'Observador' },
                    ]
                } />
              <Select label="Estado" value={editingUser.status} onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                options={[
                  { value: 'active', label: 'Activo' },
                  { value: 'suspended', label: 'Suspendido' },
                ]} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditingUser(null)}>Cancelar</Button>
              <Button size="sm" onClick={handleUpdate} disabled={saving}>
                <Save className="w-4 h-4 mr-1" /> Guardar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BillingTab({ plan, status }: { plan: string; status: string }) {
  const [plans, setPlans] = useState<{ name: string; label: string; max_users: number; price_monthly: number; price_yearly: number; features: string[] }[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    fetch('/api/plans')
      .then(r => r.json())
      .then(res => { if (res.success) setPlans(res.data || []); })
      .catch(() => {})
      .finally(() => setLoadingPlans(false));
  }, []);

  const current = plans.find(p => p.name === plan) || plans.find(p => p.name === 'free') || null;
  const otherPlans = plans.filter(p => p.name !== plan && p.name !== 'free');

  function formatPrice(cents: number): string {
    if (cents === 0) return 'Gratis';
    return `$${(cents / 100).toLocaleString('es-CL')}`;
  }

  function featuresList(p: { max_users: number; features: string[] }): string[] {
    const f: string[] = [];
    if (p.max_users > 0) f.push(`${p.max_users} usuarios`);
    else if (p.max_users === -1) f.push('Usuarios ilimitados');
    (p.features || []).forEach(feature => f.push(feature));
    return f;
  }

  return (
    <>
      <Card>
        <CardHeader><CardTitle>Plan Actual</CardTitle></CardHeader>
        <CardContent>
          {loadingPlans ? (
            <div className="p-4 text-sm text-slate-400">Cargando planes...</div>
          ) : current ? (
            <>
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div>
                  <p className="text-lg font-bold text-indigo-900">{current.label}</p>
                  <p className="text-sm text-indigo-700">{formatPrice(current.price_monthly)}/mes</p>
                </div>
                <Badge variant={status === 'active' ? 'info' : status === 'trial' ? 'warning' : 'danger'}>
                  {status === 'active' ? 'Activo' : status === 'trial' ? 'Prueba' : status === 'suspended' ? 'Suspendido' : status}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">Usuarios</p>
                  <p className="font-bold text-slate-900 mt-1">{current.max_users === -1 ? 'Ilimitados' : current.max_users}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">Precio Mensual</p>
                  <p className="font-bold text-slate-900 mt-1">{formatPrice(current.price_monthly)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">Precio Anual</p>
                  <p className="font-bold text-slate-900 mt-1">{current.price_yearly ? formatPrice(current.price_yearly) + '/año' : '—'}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 text-sm text-slate-400">No se pudo cargar la información del plan</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Planes Disponibles</CardTitle></CardHeader>
        <CardContent>
          {loadingPlans ? (
            <div className="p-4 text-sm text-slate-400">Cargando planes...</div>
          ) : otherPlans.length === 0 ? (
            <div className="p-4 text-sm text-slate-400">No hay otros planes disponibles</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {otherPlans.map((p) => (
                <div key={p.name} className={`p-4 rounded-xl border-2 transition-colors ${
                  plan === p.name ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <p className="font-bold text-slate-900">{p.label}</p>
                  <p className="text-lg font-bold text-indigo-600 mt-1">{formatPrice(p.price_monthly)}/mes</p>
                  <ul className="mt-3 space-y-1">
                    {featuresList(p).map((f, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  {plan !== p.name && (
                    <Button variant="secondary" size="sm" className="w-full mt-3">Upgrade</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    email_enabled: false, email_address: '',
    task_deadline: true, milestone_deadline: true, project_deadline: true, timesheet_reminders: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const api = getApiClient();
    api.getNotificationPreferences().then((data: any) => {
      setPrefs({
        email_enabled: data.email_enabled ?? false,
        email_address: data.email_address || '',
        task_deadline: data.task_deadline ?? true,
        milestone_deadline: data.milestone_deadline ?? true,
        project_deadline: data.project_deadline ?? true,
        timesheet_reminders: data.timesheet_reminders ?? true,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const api = getApiClient();
      await api.updateNotificationPreferences(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { toast.error('Error al guardar preferencias'); }
    setSaving(false);
  };

  if (loading) return <Card><CardContent className="p-8 text-center text-sm text-slate-500">Cargando...</CardContent></Card>;

  return (
    <Card>
      <CardHeader><CardTitle>Preferencias de Notificación</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Notificaciones por Email</p>
              <p className="text-xs text-slate-500">Recibe resúmenes y alertas importantes por correo</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={prefs.email_enabled} onChange={(e) => setPrefs(p => ({ ...p, email_enabled: e.target.checked }))} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          {prefs.email_enabled && (
            <Input label="Email para notificaciones" type="email" value={prefs.email_address}
              onChange={(e) => setPrefs(p => ({ ...p, email_address: e.target.value }))}
              placeholder="admin@empresa.cl" />
          )}
        </div>
        {[
          { key: 'task_deadline', label: 'Plazos de tareas', desc: 'Alerta cuando una tarea está por vencer en proyectos' },
          { key: 'milestone_deadline', label: 'Hitos de proyectos', desc: 'Notificación de hitos próximos a vencer' },
          { key: 'project_deadline', label: 'Fechas límite de proyectos', desc: 'Alerta cuando un proyecto está por vencer' },
          { key: 'timesheet_reminders', label: 'Recordatorios de horas', desc: 'Recordatorio para registrar horas trabajadas' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={(prefs as any)[item.key]}
                onChange={(e) => setPrefs(p => ({ ...p, [item.key]: e.target.checked }))} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        ))}
        <div className="flex justify-end gap-3 pt-4">
          {saved && <span className="text-sm text-emerald-600">Guardado correctamente</span>}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Guardando...' : 'Guardar Preferencias'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [message, setMessage] = useState('');

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) { setMessage('Las contraseñas no coinciden'); return; }
    if (newPassword.length < 8) { setMessage('Mínimo 8 caracteres'); return; }
    setChanging(true);
    setMessage('');
    try {
      const api = getApiClient();
      await (api as any).request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setMessage('Contraseña actualizada correctamente');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch { setMessage('Error al cambiar contraseña. Verifica la contraseña actual.'); }
    setChanging(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Contraseña</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Contraseña Actual" type="password" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Ingresa tu contraseña actual" />
          <Input label="Nueva Contraseña" type="password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
          <Input label="Confirmar Contraseña" type="password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la nueva contraseña" />
          {message && <p className={`text-sm ${message.includes('Error') ? 'text-rose-600' : 'text-emerald-600'}`}>{message}</p>}
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={changing || !currentPassword || !newPassword}>
              <Key className="w-4 h-4 mr-2" /> {changing ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Autenticación de Dos Factores</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">2FA con Authenticator App</p>
              <p className="text-xs text-slate-500">Agrega una capa extra de seguridad a tu cuenta</p>
            </div>
            <Badge variant="neutral">Próximamente</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
