'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge } from '@yellow-erp/ui';
import { Settings, Building2, Users, CreditCard, Bell, Shield, Globe, Save, Plus, Trash2, Mail, Key, Database, Mailbox, ShieldCheck, Zap, Webhook } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import RolesTab from './tabs/RolesTab';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState({
    name: '',
    tax_id: '',
    razon_social: '',
    giro: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    logo_url: '',
  });

  useEffect(() => {
    const api = getApiClient();
    api.getCompany().then((data) => {
      setCompany({
        name: data.name || '',
        tax_id: data.tax_id || '',
        razon_social: data.razon_social || '',
        giro: data.giro || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        region: data.region || '',
        logo_url: data.logo_url || '',
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
      alert('Error al guardar');
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
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
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
                <CardHeader>
                  <CardTitle>Datos de la Empresa</CardTitle>
                </CardHeader>
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
                      { value: '1', label: 'Arica y Parinacota' },
                      { value: '2', label: 'Tarapacá' },
                      { value: '3', label: 'Antofagasta' },
                      { value: '4', label: 'Atacama' },
                      { value: '5', label: 'Coquimbo' },
                      { value: '6', label: 'Valparaíso' },
                      { value: '7', label: 'Región del Libertador' },
                      { value: '8', label: 'Biobío' },
                      { value: '9', label: 'La Araucanía' },
                      { value: '10', label: 'Los Ríos' },
                      { value: '11', label: 'Los Lagos' },
                      { value: '12', label: 'Aysén' },
                      { value: '14', label: 'Magallanes' },
                      { value: '15', label: 'Ñuble' },
                    ]} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logo e Identidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt="Logo" className="w-24 h-24 rounded-2xl object-contain border border-slate-200" />
                    ) : (
                      <div className="w-24 h-24 bg-amber-400 rounded-2xl flex items-center justify-center text-white text-4xl font-bold">
                        {company.name ? company.name.charAt(0).toUpperCase() : 'Y'}
                      </div>
                    )}
                    <div>
                      <Button variant="secondary" onClick={async () => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          try {
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            const data = await res.json();
                            if (data.url) {
                              setCompany(p => ({ ...p, logo_url: data.url }));
                            }
                          } catch { alert('Error al subir logo'); }
                        };
                        input.click();
                      }}>Cambiar Logo</Button>
                      <p className="text-xs text-slate-500 mt-2">PNG o SVG, máximo 2MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-3">
                {saved && <span className="text-sm text-emerald-600">Guardado correctamente</span>}
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </>
          )}

          {activeTab === 'roles' && <RolesTab />}

          {activeTab === 'users' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Usuarios del Sistema</CardTitle>
                <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Invitar Usuario</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Admin', email: 'admin@yellow.cl', role: 'Admin', status: 'active' },
                      { name: 'Juan Pérez', email: 'juan@yellow.cl', role: 'Editor', status: 'active' },
                      { name: 'María López', email: 'maria@yellow.cl', role: 'Viewer', status: 'active' },
                    ].map((user, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{user.role}</td>
                        <td className="px-4 py-3">
                          <Badge variant="success">Activo</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="secondary" size="sm">Editar</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'billing' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Plan Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div>
                      <p className="text-lg font-bold text-indigo-900">Plan Professional</p>
                      <p className="text-sm text-indigo-700">$49.900/mes · Hasta 10 usuarios</p>
                    </div>
                    <Badge variant="info">Activo</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">Usuarios</p>
                      <p className="font-bold text-slate-900 mt-1">3/10</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">Almacenamiento</p>
                      <p className="font-bold text-slate-900 mt-1">2.1 GB/10 GB</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">API Calls</p>
                      <p className="font-bold text-slate-900 mt-1">12.5K/50K</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historial de Pagos</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="overflow-x-auto">
                   <table className="w-full">
                     <thead>
                       <tr className="border-b border-slate-200">
                         <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Fecha</th>
                         <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Descripción</th>
                         <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Monto</th>
                         <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Estado</th>
                       </tr>
                     </thead>
                     <tbody>
                       {[
                         { date: '2026-07-01', desc: 'Plan Professional - Julio 2026', amount: 49900, status: 'paid' },
                         { date: '2026-06-01', desc: 'Plan Professional - Junio 2026', amount: 49900, status: 'paid' },
                         { date: '2026-05-01', desc: 'Plan Professional - Mayo 2026', amount: 49900, status: 'paid' },
                       ].map((payment, i) => (
                         <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                           <td className="px-4 py-3 text-sm text-slate-600">{payment.date}</td>
                           <td className="px-4 py-3 text-sm text-slate-900">{payment.desc}</td>
                           <td className="px-4 py-3 text-sm text-right font-medium">${payment.amount.toLocaleString('es-CL')}</td>
                           <td className="px-4 py-3"><Badge variant="success">Pagado</Badge></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                   </div>
                 </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Nuevas ventas', description: 'Recibir alerta cuando se registre una venta', enabled: true },
                  { label: 'Stock bajo', description: 'Alerta cuando un producto esté por debajo del mínimo', enabled: true },
                  { label: 'Facturas vencidas', description: 'Notificación de facturas que pasan su fecha de vencimiento', enabled: true },
                  { label: 'Pagos recibidos', description: 'Confirmación de pagos de clientes', enabled: false },
                  { label: 'Reportes semanales', description: 'Resumen semanal de actividad del ERP', enabled: false },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{notif.label}</p>
                      <p className="text-xs text-slate-500">{notif.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
                <div className="flex justify-end pt-4">
                  <Button><Save className="w-4 h-4 mr-2" /> Guardar Preferencias</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contraseña</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input label="Contraseña Actual" type="password" placeholder="Ingresa tu contraseña actual" />
                  <Input label="Nueva Contraseña" type="password" placeholder="Mínimo 8 caracteres" />
                  <Input label="Confirmar Contraseña" type="password" placeholder="Repite la nueva contraseña" />
                  <div className="flex justify-end">
                    <Button><Key className="w-4 h-4 mr-2" /> Cambiar Contraseña</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Autenticación de Dos Factores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">2FA con Authenticator App</p>
                      <p className="text-xs text-slate-500">Agrega una capa extra de seguridad a tu cuenta</p>
                    </div>
                    <Button variant="secondary">Configurar</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sesiones Activas</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="overflow-x-auto">
                   <table className="w-full">
                     <thead>
                       <tr className="border-b border-slate-200">
                         <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Dispositivo</th>
                         <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">IP</th>
                         <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Última Actividad</th>
                         <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Estado</th>
                       </tr>
                     </thead>
                     <tbody>
                       <tr className="border-b border-slate-100">
                         <td className="px-4 py-3 text-sm text-slate-900">Chrome · Windows</td>
                         <td className="px-4 py-3 text-sm text-slate-600">192.168.1.100</td>
                         <td className="px-4 py-3 text-sm text-slate-600">Ahora</td>
                         <td className="px-4 py-3"><Badge variant="success">Actual</Badge></td>
                       </tr>
                     </tbody>
                   </table>
                   </div>
                 </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle>Integraciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'SII (Servicio de Impuestos Internos)', desc: 'Emisión electrónica de documentos', connected: true, icon: Database },
                  { name: 'Transbank', desc: 'Pasarela de pagos con tarjetas', connected: false, icon: CreditCard },
                  { name: 'Correo Electrónico', desc: 'Envío de notificaciones por email', connected: true, icon: Mail },
                  { name: 'Google Workspace', desc: 'Sincronización de calendarios y contactos', connected: false, icon: Globe },
                ].map((integration, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                        <integration.icon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{integration.name}</p>
                        <p className="text-xs text-slate-500">{integration.desc}</p>
                      </div>
                    </div>
                    <Badge variant={integration.connected ? 'success' : 'neutral'}>
                      {integration.connected ? 'Conectado' : 'No conectado'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
                  <Card className="bg-slate-50">
                    <CardContent className="p-6">
                      <Zap className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                      <p className="font-medium text-slate-900">Eventos en Tiempo Real</p>
                      <p className="text-sm text-slate-500 mt-1">Recibe notificaciones instantáneas de stock, ventas, compras y más</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-50">
                    <CardContent className="p-6">
                      <Shield className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="font-medium text-slate-900">Seguro y Confiable</p>
                      <p className="text-sm text-slate-500 mt-1">Firma HMAC, reintentos exponenciales y logs de entrega</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-50">
                    <CardContent className="p-6">
                      <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium text-slate-900">Fácil Integración</p>
                      <p className="text-sm text-slate-500 mt-1">JSON sobre HTTP/HTTPS, eventos tipados y documentados</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600 mb-4">Configura endpoints HTTP para recibir eventos como:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {[
                      'stock.changed', 'stock.low', 'stock.out',
                      'batch.expiring', 'batch.expired',
                      'return.created', 'return.approved',
                      'order.created', 'order.shipped',
                      'invoice.created', 'invoice.paid', 'invoice.overdue',
                      'purchase_order.created', 'purchase_order.received',
                    ].map((event, i) => (
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