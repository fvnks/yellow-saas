'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Key, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SIIConfigPage() {
  const companyId = typeof window !== 'undefined' 
    ? (() => {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
        if (!authCookie) return null;
        try {
          const base64 = authCookie.split('=')[1].split('.')[1];
          const decoded = decodeURIComponent(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
          return JSON.parse(decoded).company_id;
        } catch { return null; }
      })()
    : null;

  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sii_username: '',
    sii_password: '',
    sii_test_mode: true,
    sii_cert_path: '',
    sii_cert_password: '',
    sii_quota_enabled: false,
    sii_quota_limit: 100,
    sii_document_type_default: '33',
  });

  useEffect(() => {
    if (companyId) fetchConfig();
  }, [companyId]);

  async function fetchConfig() {
    try {
      const res = await fetch(`/api/companies/${companyId}/sii/config`);
      const json = await res.json();
      if (json.success) {
        setConfig(json.data);
        setForm(prev => ({ ...prev, sii_test_mode: json.data.test_mode }));
      }
    } catch {
      toast.error('Error al cargar configuración SII');
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig() {
    setSaving(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/sii/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Configuración SII guardada correctamente');
        fetchConfig();
      } else {
        toast.error(json.error?.message || 'Error al guardar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    try {
      const res = await fetch(`/api/companies/${companyId}/sii/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Conexión SII exitosa (modo prueba)');
      } else {
        toast.error(json.error?.message || 'Error en la conexión SII');
      }
    } catch {
      toast.error('Error de conexión');
    }
  }

  if (loading) return <div className="p-12 text-center text-slate-500">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#FACC15]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Configuración SII</h1>
            <p className="text-xs text-slate-500">Configura las credenciales para el envío de DTEs al Servicio de Impuestos Internos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-500" />
              Credenciales SII
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Usuario SII</label>
                <input
                  type="text"
                  value={form.sii_username}
                  onChange={(e) => setForm({ ...form, sii_username: e.target.value })}
                  placeholder="Tu RUT sin puntos ni guión"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Contraseña SII</label>
                <input
                  type="password"
                  value={form.sii_password}
                  onChange={(e) => setForm({ ...form, sii_password: e.target.value })}
                  placeholder="Contraseña del portal SII"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Modo Prueba Activo</p>
                  <p className="text-xs text-amber-700 mt-0.5">Los DTEs se generarán pero no se enviarán realmente al SII</p>
                </div>
                <label className="ml-auto flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.sii_test_mode}
                    onChange={(e) => setForm({ ...form, sii_test_mode: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700">Test Mode</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Download className="w-4 h-4 text-slate-500" />
              Certificado Digital
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Ruta del certificado (.p12/.pfx)</label>
                <input
                  type="text"
                  value={form.sii_cert_path}
                  onChange={(e) => setForm({ ...form, sii_cert_path: e.target.value })}
                  placeholder="/ruta/al/certificado.p12"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Contraseña del certificado</label>
                <input
                  type="password"
                  value={form.sii_cert_password}
                  onChange={(e) => setForm({ ...form, sii_cert_password: e.target.value })}
                  placeholder="Password del certificado digital"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Cuota de Envío SII</h3>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.sii_quota_enabled}
                  onChange={(e) => setForm({ ...form, sii_quota_enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">Activar cuota de envío</span>
              </label>
              {form.sii_quota_enabled && (
                <input
                  type="number"
                  value={form.sii_quota_limit}
                  onChange={(e) => setForm({ ...form, sii_quota_limit: parseInt(e.target.value) })}
                  className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  min="1"
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Estado de Conexión</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-medium text-slate-600">Usuario</span>
                <span className="text-xs font-bold text-slate-900">
                  {config?.username || 'No configurado'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-medium text-slate-600">Certificado</span>
                <span className="text-xs font-bold text-slate-900">
                  {config?.has_certificate ? 'Configurado' : 'No configurado'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-medium text-slate-600">Modo Prueba</span>
                <span className={`text-xs font-bold ${config?.test_mode ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {config?.test_mode ? 'Activado' : 'Desactivado'}
                </span>
              </div>

              {config?.last_submission && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-medium text-slate-600">Último envío</span>
                  <span className="text-xs font-bold text-slate-900">
                    {new Date(config.last_submission).toLocaleDateString('es-CL')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>

            <button
              onClick={testConnection}
              className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Probar Conexión SII
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-blue-800">¿Necesitas ayuda?</p>
            <p className="text-xs text-blue-700 mt-1">
              Las credenciales SII se pueden obtener en el portal del SII en la sección &quot;ClaveSII&quot; o &quot;Token SII&quot;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
