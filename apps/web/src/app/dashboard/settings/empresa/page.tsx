'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select } from '@yellow-erp/ui';
import { Save, Upload, Building2, User, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';

interface CompanyData {
  id: string;
  name: string;
  tax_id: string;
  razon_social: string;
  giro: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  logo_url: string;
  plan: string;
  status: string;
  acteo_code: string;
  acteo_description: string;
}

interface LegalRepresentative {
  full_name: string;
  rut: string;
  email: string;
  phone: string;
  position: string;
}

export default function EmpresaPage() {
  const [company, setCompany] = useState<CompanyData>({
    id: '', name: '', tax_id: '', razon_social: '', giro: '',
    email: '', phone: '', address: '', city: '', region: '', logo_url: '',
    plan: 'free', status: 'active', acteo_code: '', acteo_description: '',
  });
  const [representative, setRepresentative] = useState<LegalRepresentative>({
    full_name: '', rut: '', email: '', phone: '', position: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'datos', label: 'Datos de la Empresa', icon: Building2 },
    { id: 'representante', label: 'Representante Legal', icon: User },
    { id: 'sii', label: 'SII / ACTEO', icon: FileText },
  ];
  const [activeTab, setActiveTab] = useState('datos');

  useEffect(() => {
    const api = getApiClient();
    api.getCompany().then((data: any) => {
      setCompany({
        id: data.id || '',
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
        plan: data.plan || 'free',
        status: data.status || 'active',
        acteo_code: data.acteo_code || '',
        acteo_description: data.acteo_description || '',
      });
      setRepresentative({
        full_name: data.legal_rep_name || '',
        rut: data.legal_rep_rut || '',
        email: data.legal_rep_email || '',
        phone: data.legal_rep_phone || '',
        position: data.legal_rep_position || '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSaveCompany = async () => {
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

  const handleSaveRepresentative = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const api = getApiClient();
      await (api as any).updateCompany({
        legal_rep_name: representative.full_name,
        legal_rep_rut: representative.rut,
        legal_rep_email: representative.email,
        legal_rep_phone: representative.phone,
        legal_rep_position: representative.position,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('Error al guardar representante');
    } finally {
      setSaving(false);
    }
  };

  const regiones = [
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
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Empresa</h1>
          <p className="text-sm text-muted-foreground mt-1">Cargando información...</p>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center">
          <div className="animate-pulse bg-slate-200 h-6 w-48 rounded mx-auto mb-4" />
          <div className="animate-pulse bg-slate-200 h-4 w-32 rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Empresa</h1>
        <p className="text-sm text-muted-foreground mt-1">Información general de la empresa y configuración fiscal</p>
      </div>

      <ContinuousTabs tabs={tabs} defaultActiveId={activeTab} onChange={setActiveTab} />

      {/* Tab: Datos de la Empresa */}
      {activeTab === 'datos' && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          <h3 className="text-sm font-semibold text-foreground">Datos de la Empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre de la Empresa"
              value={company.name}
              onChange={(e) => setCompany(p => ({ ...p, name: e.target.value }))}
              placeholder="Nombre comercial"
            />
            <Input
              label="Razón Social"
              value={company.razon_social}
              onChange={(e) => setCompany(p => ({ ...p, razon_social: e.target.value }))}
              placeholder="Razón social ante el SII"
            />
            <Input
              label="RUT"
              value={company.tax_id}
              onChange={(e) => setCompany(p => ({ ...p, tax_id: e.target.value }))}
              placeholder="12.345.678-9"
            />
            <Input
              label="Giro"
              value={company.giro}
              onChange={(e) => setCompany(p => ({ ...p, giro: e.target.value }))}
              placeholder="Giro comercial"
            />
            <Input
              label="Email Corporativo"
              type="email"
              value={company.email}
              onChange={(e) => setCompany(p => ({ ...p, email: e.target.value }))}
              placeholder="contacto@empresa.cl"
            />
            <Input
              label="Teléfono"
              value={company.phone}
              onChange={(e) => setCompany(p => ({ ...p, phone: e.target.value }))}
              placeholder="+56 9 1234 5678"
            />
          </div>
          <Input
            label="Dirección"
            value={company.address}
            onChange={(e) => setCompany(p => ({ ...p, address: e.target.value }))}
            placeholder="Av. Ejemplo 1234"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ciudad"
              value={company.city}
              onChange={(e) => setCompany(p => ({ ...p, city: e.target.value }))}
              placeholder="Santiago"
            />
            <Select
              label="Región"
              value={company.region}
              onChange={(e) => setCompany(p => ({ ...p, region: e.target.value }))}
              options={regiones}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {saved && <span className="text-sm text-emerald-600">Guardado correctamente</span>}
            <Button onClick={handleSaveCompany} disabled={saving}>
              <Save className="w-4 h-4 mr-2" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      )}

      {/* Tab: Representante Legal */}
      {activeTab === 'representante' && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          <h3 className="text-sm font-semibold text-foreground">Representante Legal</h3>
          <p className="text-xs text-muted-foreground">Información del representante legal registrado ante el SII.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre Completo"
              value={representative.full_name}
              onChange={(e) => setRepresentative(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Juan Pérez González"
            />
            <Input
              label="RUT"
              value={representative.rut}
              onChange={(e) => setRepresentative(p => ({ ...p, rut: e.target.value }))}
              placeholder="12.345.678-9"
            />
            <Input
              label="Email"
              type="email"
              value={representative.email}
              onChange={(e) => setRepresentative(p => ({ ...p, email: e.target.value }))}
              placeholder="representante@empresa.cl"
            />
            <Input
              label="Teléfono"
              value={representative.phone}
              onChange={(e) => setRepresentative(p => ({ ...p, phone: e.target.value }))}
              placeholder="+56 9 1234 5678"
            />
            <Input
              label="Cargo"
              value={representative.position}
              onChange={(e) => setRepresentative(p => ({ ...p, position: e.target.value }))}
              placeholder="Gerente General"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {saved && <span className="text-sm text-emerald-600">Guardado correctamente</span>}
            <Button onClick={handleSaveRepresentative} disabled={saving}>
              <Save className="w-4 h-4 mr-2" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      )}

      {/* Tab: SII / ACTEO */}
      {activeTab === 'sii' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-semibold text-foreground">Código de Actividad Económica (ACTEO)</h3>
            <p className="text-xs text-muted-foreground">
              Ingrese el código ACTEO correspondiente a la actividad económica principal de su empresa según el SII.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Código ACTEO"
                value={company.acteo_code || ''}
                onChange={(e) => setCompany(p => ({ ...p, acteo_code: e.target.value }))}
                placeholder="Ej: 471100"
              />
              <Input
                label="Descripción de Actividad"
                value={company.acteo_description || ''}
                onChange={(e) => setCompany(p => ({ ...p, acteo_description: e.target.value }))}
                placeholder="Ej: Comercio al por menor en establecimientos mercantiles"
              />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-medium">¿Qué es el código ACTEO?</p>
              <p className="text-xs text-blue-600 mt-1">
                Es el código de actividad económica asignado por el SII que identifica el giro principal de la empresa.
                Se utiliza en la emisión de documentos electrónicos y declaraciones de impuestos.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-semibold text-foreground">Logo de la Empresa</h3>
            <p className="text-xs text-muted-foreground">
              Logo que aparecerá en los documentos electrónicos y en la interfaz del sistema.
            </p>
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-muted hover:bg-muted transition-colors cursor-pointer">
                {company.logo_url ? (
                  <img src={company.logo_url} alt="Logo empresa" className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p className="text-[9px] text-muted-foreground">Subir logo</p>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="URL del Logo"
                    value={company.logo_url}
                    onChange={(e) => setCompany(p => ({ ...p, logo_url: e.target.value }))}
                    placeholder="https://empresa.cl/logo.png"
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-foreground">Formatos aceptados</label>
                    <p className="text-xs text-muted-foreground">PNG, JPG, SVG (max. 2MB)</p>
                    <p className="text-xs text-muted-foreground">Recomendado: 512x512px</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Estado de Conexión SII</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase">Ambiente</p>
                <p className="text-sm font-medium text-foreground mt-1">Producción</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase">Estado</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
                  Conectado
                </span>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase">Última Verificación</p>
                <p className="text-sm font-medium text-foreground mt-1">Hoy</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {saved && <span className="text-sm text-emerald-600">Guardado correctamente</span>}
            <Button onClick={handleSaveCompany} disabled={saving}>
              <Save className="w-4 h-4 mr-2" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
