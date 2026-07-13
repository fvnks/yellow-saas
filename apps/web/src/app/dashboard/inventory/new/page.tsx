'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@yellow-erp/ui';
import { ArrowLeft, Save, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient } from '../../../../lib/api-client';

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('product');
  const [unitOfMeasure, setUnitOfMeasure] = useState('un');
  const [costPrice, setCostPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [maxStock, setMaxStock] = useState(0);
  const [trackStock, setTrackStock] = useState(true);
  const [barcode, setBarcode] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSave = async () => {
    if (!name.trim() || !sku.trim()) {
      setError('Nombre y SKU son obligatorios');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const api = getApiClient();
      await api.createProduct({
        name: name.trim(),
        sku: sku.trim(),
        price: salePrice,
        description: description.trim(),
        type,
        unit_of_measure: unitOfMeasure,
        cost_price: costPrice,
        sale_price: salePrice,
        min_stock: minStock,
        max_stock: maxStock,
        track_stock: trackStock,
        barcode: barcode.trim(),
        is_active: isActive,
      } as any);
      router.push('/dashboard/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el producto');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventory" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Nuevo Producto</h1>
          <p className="text-sm text-slate-500 mt-1">Crear un nuevo producto en el inventario</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Crear Producto'}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="SKU *" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Ej: PROD-001" />
                <Input label="Nombre *" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del producto" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Descripción del producto..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Tipo"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  options={[
                    { value: 'product', label: 'Producto' },
                    { value: 'service', label: 'Servicio' },
                    { value: 'raw_material', label: 'Materia Prima' },
                  ]}
                />
                <Select
                  label="Unidad de Medida"
                  value={unitOfMeasure}
                  onChange={(e) => setUnitOfMeasure(e.target.value)}
                  options={[
                    { value: 'un', label: 'Unidad' },
                    { value: 'kg', label: 'Kilogramo' },
                    { value: 'lt', label: 'Litro' },
                    { value: 'mt', label: 'Metro' },
                    { value: 'm2', label: 'Metro Cuadrado' },
                    { value: 'm3', label: 'Metro Cúbico' },
                    { value: 'caja', label: 'Caja' },
                    { value: 'pallet', label: 'Pallet' },
                  ]}
                />
              </div>
              <Input label="Código de Barras" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Código de barras" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Precio de Costo" type="number" value={costPrice} onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)} />
                <Input label="Precio de Venta" type="number" value={salePrice} onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Rastrear Stock</label>
                <button
                  onClick={() => setTrackStock(!trackStock)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${trackStock ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${trackStock ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {trackStock && (
                <div className="space-y-3">
                  <Input label="Stock Mínimo" type="number" value={minStock} onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)} />
                  <Input label="Stock Máximo" type="number" value={maxStock} onChange={(e) => setMaxStock(parseFloat(e.target.value) || 0)} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Activo</label>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</p>
                  <p className="font-medium text-slate-900">{sku || '—'}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Costo</span>
                <span className="font-medium">${costPrice.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Venta</span>
                <span className="font-medium">${salePrice.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Margen</span>
                <span className="font-medium">
                  {costPrice > 0 ? `${(((salePrice - costPrice) / costPrice) * 100).toFixed(1)}%` : '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
