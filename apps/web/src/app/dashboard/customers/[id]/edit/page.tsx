'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input } from '@yellow-erp/ui';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [priceLists, setPriceLists] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('CL');
  const [postalCode, setPostalCode] = useState('');
  const [website, setWebsite] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30');
  const [creditLimit, setCreditLimit] = useState('');
  const [priceListId, setPriceListId] = useState('');
  const [taxExempt, setTaxExempt] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [portalEnabled, setPortalEnabled] = useState(false);
  const [portalToken, setPortalToken] = useState('');

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getCustomer(id),
      api.getPriceLists().catch(() => ({ data: [] })),
      api.getCustomerCategories().catch(() => ({ data: [] })),
      api.getCustomerSegments().catch(() => ({ data: [] })),
    ]).then(([customerData, pl, cat, seg]) => {
      const c = customerData as any;
      setName(c.name || '');
      setTradeName(c.trade_name || '');
      setTaxId(c.tax_id || '');
      setEmail(c.email || '');
      setPhone(c.phone || '');
      setAddress(c.address || '');
      setCity(c.city || '');
      setRegion(c.region || '');
      setCountry(c.country || 'CL');
      setPostalCode(c.postal_code || '');
      setWebsite(c.website || '');
      setContactPerson(c.contact_person || '');
      setContactPhone(c.contact_phone || '');
      setContactEmail(c.contact_email || '');
      setPaymentTerms(String(c.payment_terms || 0));
      setCreditLimit(String(c.credit_limit || ''));
      setPriceListId(c.price_list_id || '');
      setTaxExempt(c.tax_exempt || false);
      setCategoryId(c.category_id || '');
      setSegmentId(c.segment_id || '');
      setNotes(c.notes || '');
      setIsActive(c.is_active !== false);
      setPortalEnabled(c.portal_enabled || false);
      setPortalToken(c.portal_token || '');
      setPriceLists(pl.data || []);
      setCategories(cat.data || []);
      setSegments(seg.data || []);
      setLoading(false);
    }).catch(() => {
      setError('No se pudo cargar el cliente');
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setSaving(true);
    setError('');
    const api = getApiClient();
    try {
      await api.updateCustomer(id, {
        name: name.trim(),
        trade_name: tradeName.trim() || undefined,
        tax_id: taxId.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        region: region.trim() || undefined,
        country: country || undefined,
        postal_code: postalCode.trim() || undefined,
        website: website.trim() || undefined,
        contact_person: contactPerson.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
        contact_email: contactEmail.trim() || undefined,
        payment_terms: parseInt(paymentTerms) || 0,
        credit_limit: parseFloat(creditLimit) || 0,
        price_list_id: priceListId || undefined,
        tax_exempt: taxExempt,
        category_id: categoryId || undefined,
        segment_id: segmentId || undefined,
        notes: notes.trim() || undefined,
        is_active: isActive,
        portal_enabled: portalEnabled,
      });
      toast.success('Cliente actualizado exitosamente');
      router.push(`/dashboard/customers/${id}`);
    } catch {
      setError('Error al guardar los cambios');
      toast.error('Error al actualizar cliente');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
        <Card><CardContent><div className="h-96 bg-slate-100 rounded animate-pulse" /></CardContent></Card>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Cliente no encontrado</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-sm text-slate-500">{error}</p>
            <Link href="/dashboard/customers"><Button className="mt-4">Volver a Clientes</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/customers/${id}`} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Editar Cliente</h1>
          <p className="text-sm text-slate-500 mt-1">{name}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Datos Generales */}
          <Card>
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Datos Generales</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nombre *" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del cliente" />
                <Input label="Razón Social" value={tradeName} onChange={(e) => setTradeName(e.target.value)} placeholder="Razón social" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="RUT" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="12.345.678-9" />
                <Input label="Código" value="" onChange={() => {}} placeholder="Autogenerado" disabled />
              </div>
            </div>
          </Card>

          {/* Contacto */}
          <Card>
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Contacto</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contacto@empresa.cl" />
                <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 1234 5678" />
              </div>
              <Input label="Sitio Web" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://empresa.cl" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Contacto" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Nombre del contacto" />
                <Input label="Tel. Contacto" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+56 9 1234 5678" />
                <Input label="Email Contacto" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contacto@empresa.cl" />
              </div>
            </div>
          </Card>

          {/* Dirección */}
          <Card>
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Dirección</h3>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Providencia 1234" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Santiago" />
                <Input label="Región" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Metropolitana" />
                <Input label="Código Postal" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="7500000" />
              </div>
            </div>
          </Card>

          {/* Crédito y Pagos */}
          <Card>
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Crédito y Pagos</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Plazo de Pago (días)" type="number" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="30" />
                <Input label="Límite de Crédito" type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder="0" />
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Lista de Precios</label>
                  <select value={priceListId} onChange={(e) => setPriceListId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Ninguna</option>
                    {priceLists.map((pl: any) => (
                      <option key={pl.id} value={pl.id}>{pl.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setTaxExempt(!taxExempt)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${taxExempt ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${taxExempt ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <label className="text-sm font-medium text-slate-700">Exento de IVA</label>
              </div>
            </div>
          </Card>

          {/* Clasificación */}
          <Card>
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Clasificación</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Categoría</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Sin categoría</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Segmento</label>
                  <select value={segmentId} onChange={(e) => setSegmentId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Sin segmento</option>
                    {segments.map((seg: any) => (
                      <option key={seg.id} value={seg.id}>{seg.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Notas</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Notas adicionales..." />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Estado</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Activo</label>
                <button onClick={() => setIsActive(!isActive)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Portal Cliente</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Habilitar Portal</label>
                <button onClick={() => setPortalEnabled(!portalEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${portalEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${portalEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {portalEnabled && portalToken && (
                <div className="space-y-1">
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">URL del Portal</label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/portal/customer/${portalToken}`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/portal/customer/${portalToken}`);
                        toast.success('URL copiada');
                      }}
                      className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm sticky top-24">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Resumen</h3>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Nombre</span>
                <span className="font-medium">{name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">RUT</span>
                <span className="font-medium font-mono">{taxId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
