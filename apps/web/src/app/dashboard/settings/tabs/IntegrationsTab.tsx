'use client';

import { useState, useEffect } from 'react';
import { Globe, CreditCard, Mail, Zap, Check, ExternalLink, Settings, Key, Server, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'payment' | 'tax' | 'email' | 'accounting';
  status: 'connected' | 'disconfigured' | 'available';
  configFields: ConfigField[];
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'toggle';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'sii',
    name: 'SII - Servicio de Impuestos Internos',
    description: 'Facturación electrónica, libros de compra y venta, declaración de impuestos.',
    icon: Zap,
    category: 'tax',
    status: 'available',
    configFields: [
      { key: 'sii_username', label: 'Usuario SII', type: 'text', placeholder: 'RUT sin guiones', required: true },
      { key: 'sii_password', label: 'Contraseña SII', type: 'password', required: true },
      { key: 'sii_certificate', label: 'Certificado Digital (.p12)', type: 'text', placeholder: 'Ruta o contenido del certificado' },
      { key: 'sii_environment', label: 'Ambiente', type: 'select', options: [
        { value: 'production', label: 'Producción' },
        { value: 'certification', label: 'Certificación' },
      ], required: true },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Procesamiento de pagos internacionales con tarjetas de crédito y débito.',
    icon: CreditCard,
    category: 'payment',
    status: 'available',
    configFields: [
      { key: 'stripe_secret_key', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...', required: true },
      { key: 'stripe_publishable_key', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...', required: true },
      { key: 'stripe_webhook_secret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...' },
      { key: 'stripe_currency', label: 'Moneda', type: 'select', options: [
        { value: 'clp', label: 'CLP (Peso Chileno)' },
        { value: 'usd', label: 'USD (Dólar)' },
      ]},
    ],
  },
  {
    id: 'mach',
    name: 'Mach',
    description: 'Pasarela de pagos chilena. Transferencias, QR y pagos con débito.',
    icon: ArrowLeftRight,
    category: 'payment',
    status: 'available',
    configFields: [
      { key: 'mach_api_key', label: 'API Key', type: 'password', placeholder: 'Tu API Key de Mach', required: true },
      { key: 'mach_secret', label: 'Secret Key', type: 'password', required: true },
      { key: 'mach_merchant_id', label: 'Merchant ID', type: 'text', required: true },
      { key: 'mach_environment', label: 'Ambiente', type: 'select', options: [
        { value: 'production', label: 'Producción' },
        { value: 'sandbox', label: 'Sandbox (Pruebas)' },
      ], required: true },
    ],
  },
  {
    id: 'email',
    name: 'Email (SMTP)',
    description: 'Configuración del servidor de correo para envío de notificaciones y documentos.',
    icon: Mail,
    category: 'email',
    status: 'available',
    configFields: [
      { key: 'smtp_host', label: 'Servidor SMTP', type: 'text', placeholder: 'smtp.gmail.com', required: true },
      { key: 'smtp_port', label: 'Puerto', type: 'text', placeholder: '587', required: true },
      { key: 'smtp_user', label: 'Usuario', type: 'text', placeholder: 'correo@empresa.cl', required: true },
      { key: 'smtp_password', label: 'Contraseña', type: 'password', required: true },
      { key: 'smtp_from_name', label: 'Nombre remitente', type: 'text', placeholder: 'Yellow ERP' },
      { key: 'smtp_from_email', label: 'Email remitente', type: 'text', placeholder: 'no-reply@empresa.cl', required: true },
      { key: 'smtp_encryption', label: 'Cifrado', type: 'select', options: [
        { value: 'tls', label: 'TLS' },
        { value: 'ssl', label: 'SSL' },
        { value: 'none', label: 'Ninguno' },
      ]},
    ],
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  payment: 'Pagos',
  tax: 'Impuestos',
  email: 'Correo',
  accounting: 'Contabilidad',
};

export default function IntegrationsTab() {
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const api = getApiClient();
      const data = await (api as any).request('/integrations');
      setConfigs(data || {});
    } catch {
      setConfigs({});
    }
  };

  const handleConfigChange = (integrationId: string, key: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        [key]: value,
      },
    }));
  };

  const handleSave = async (integrationId: string) => {
    setSaving(integrationId);
    try {
      const api = getApiClient();
      await (api as any).request('/integrations', {
        method: 'PUT',
        body: JSON.stringify({ integration_id: integrationId, config: configs[integrationId] || {} }),
      });
      toast.success('Configuración guardada');
    } catch {
      toast.error('Error al guardar configuración');
    }
    setSaving(null);
  };

  const handleTest = async (integrationId: string) => {
    setTesting(integrationId);
    try {
      const api = getApiClient();
      const result = await (api as any).request('/integrations/test', {
        method: 'POST',
        body: JSON.stringify({ integration_id: integrationId, config: configs[integrationId] || {} }),
      });
      if (result.success) {
        toast.success(`Conexión exitosa con ${integrationId.toUpperCase()}`);
      } else {
        toast.error(result.message || 'Error en la conexión');
      }
    } catch {
      toast.error('Error al probar conexión');
    }
    setTesting(null);
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm(`¿Desconectar ${integrationId.toUpperCase()}?`)) return;
    try {
      const api = getApiClient();
      await (api as any).request('/integrations', {
        method: 'DELETE',
        body: JSON.stringify({ integration_id: integrationId }),
      });
      setConfigs(prev => {
        const next = { ...prev };
        delete next[integrationId];
        return next;
      });
      toast.success('Integración desconectada');
    } catch {
      toast.error('Error al desconectar');
    }
  };

  const categories = [...new Set(INTEGRATIONS.map(i => i.category))];

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {CATEGORY_LABELS[category] || category}
          </h3>
          <div className="space-y-3">
            {INTEGRATIONS.filter(i => i.category === category).map(integration => {
              const Icon = integration.icon;
              const config = configs[integration.id] || {};
              const hasConfig = Object.keys(config).length > 0;
              const isExpanded = expandedId === integration.id;

              return (
                <div key={integration.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        hasConfig ? 'bg-emerald-50' : 'bg-slate-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${hasConfig ? 'text-emerald-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900">{integration.name}</h4>
                          {hasConfig && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-2.5 h-2.5" /> Configurado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasConfig && (
                        <>
                          <button onClick={() => handleTest(integration.id)} disabled={testing === integration.id}
                            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50">
                            {testing === integration.id ? 'Probando...' : 'Probar'}
                          </button>
                          <button onClick={() => handleDisconnect(integration.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                            Desconectar
                          </button>
                        </>
                      )}
                      <button onClick={() => setExpandedId(isExpanded ? null : integration.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {integration.configFields.map(field => (
                          <div key={field.key} className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            {field.type === 'select' ? (
                              <select
                                value={config[field.key] || ''}
                                onChange={e => handleConfigChange(integration.id, field.key, e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              >
                                <option value="">Seleccionar...</option>
                                {field.options?.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type}
                                value={config[field.key] || ''}
                                onChange={e => handleConfigChange(integration.id, field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setExpandedId(null)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                          Cancelar
                        </button>
                        <button onClick={() => handleSave(integration.id)} disabled={saving === integration.id}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
                          <Check className="w-3.5 h-3.5" /> {saving === integration.id ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
