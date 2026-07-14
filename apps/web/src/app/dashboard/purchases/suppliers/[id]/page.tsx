'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@yellow-erp/ui';
import { ArrowLeft, Mail, Phone, MapPin, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  tax_id: string;
  address: string;
}

export default function SupplierDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const api = getApiClient();
    api.getSupplier(id)
      .then((data) => {
        setSupplier(data as unknown as Supplier);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar el proveedor');
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    setDeleting(true);
    try {
      const api = getApiClient();
      await api.deleteSupplier(id);
      router.push('/dashboard/purchases');
    } catch {
      setError('Error al eliminar el proveedor');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
        <Card><CardContent><div className="h-48 bg-slate-100 rounded animate-pulse" /></CardContent></Card>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/purchases" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Proveedor no encontrado</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-sm text-slate-500">{error || 'El proveedor solicitado no existe.'}</p>
            <Link href="/dashboard/purchases">
              <Button className="mt-4">Volver a Compras</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/purchases" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{supplier.name}</h1>
            <Badge variant="success">Activo</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">{supplier.tax_id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/purchases/suppliers/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-slate-900">{supplier.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Teléfono</p>
                <p className="text-sm font-medium text-slate-900">{supplier.phone || '—'}</p>
              </div>
            </div>
            {supplier.address && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Dirección</p>
                  <p className="text-sm font-medium text-slate-900">{supplier.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">RUT / Tax ID</span>
              <span className="font-medium text-slate-900 font-mono">{supplier.tax_id || '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Estado</span>
              <Badge variant="success">Activo</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
