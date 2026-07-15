'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Input } from '@yellow-erp/ui';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';

export default function NewCustomerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setSaving(true);
    setError('');
    const api = getApiClient();
    try {
      const result = await api.createCustomer({
        name: name.trim(),
        tax_id: taxId.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      router.push(`/dashboard/customers/${result.id}`);
    } catch {
      setError('Error al crear el cliente');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/customers" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Nuevo Cliente</h1>
          <p className="text-sm text-slate-500 mt-1">Registrar un nuevo cliente</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Crear Cliente'}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Información General</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nombre *" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del cliente" />
                <Input label="RUT" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="12.345.678-9" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contacto@empresa.cl" />
                <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 1234 5678" />
              </div>
              <Input label="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Providencia 1234, Santiago" />
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
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
                <span className="text-slate-500">Email</span>
                <span className="font-medium">{email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teléfono</span>
                <span className="font-medium">{phone || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
