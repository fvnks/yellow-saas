'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@yellow-erp/ui';
import { ArrowLeft, Save, Package, MapPin, Warehouse, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface LayoutPosition {
  id: string;
  name: string;
  code: string;
  capacity: number;
  current_stock: number;
  product?: { id: string; name: string; sku: string } | null;
}

interface LayoutShelf {
  id: string;
  name: string;
  code: string;
  positions: LayoutPosition[];
}

interface LayoutZone {
  id: string;
  name: string;
  code: string;
  color: string;
  shelves: LayoutShelf[];
}

interface WarehouseOption {
  id: string;
  name: string;
}

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

  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [zones, setZones] = useState<LayoutZone[]>([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [shelves, setShelves] = useState<LayoutShelf[]>([]);
  const [selectedShelf, setSelectedShelf] = useState('');
  const [positions, setPositions] = useState<LayoutPosition[]>([]);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [costCenters, setCostCenters] = useState<{ id: string; name: string; code: string }[]>([]);
  const [selectedCostCenter, setSelectedCostCenter] = useState('');
  const [taxes, setTaxes] = useState<{ id: string; name: string; rate: number; code: string }[]>([]);
  const [selectedTaxId, setSelectedTaxId] = useState('');
  const [uomList, setUomList] = useState<{ code: string; name: string }[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const api = getApiClient();
    api.getWarehouses().then((res) => {
      const list = (res.data || []).map((w: { id: string; name: string }) => ({ id: w.id, name: w.name }));
      setWarehouses(list);
    }).catch(() => {});
    api.getCostCenters().then((res) => {
      setCostCenters((res.data || []).map((cc: any) => ({ id: cc.id, name: cc.name, code: cc.code })));
    }).catch(() => {});
    api.getTaxes().then((res) => {
      setTaxes((res.data || []).map((t: any) => ({ id: t.id, name: t.name, rate: t.rate, code: t.code })));
    }).catch(() => {});
    api.getUnitsOfMeasure({ limit: '200' }).then((res) => {
      setUomList((res.data || []).map((u: any) => ({ code: u.code, name: u.name })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedWarehouse) {
      setZones([]);
      setSelectedZone('');
      setShelves([]);
      setSelectedShelf('');
      setPositions([]);
      setSelectedPosition('');
      return;
    }
    setLayoutLoading(true);
    const api = getApiClient();
    api.getWarehouseLayout(selectedWarehouse)
      .then((data) => {
        const layout = (data as { zones: LayoutZone[] }).zones || [];
        setZones(layout);
        setSelectedZone('');
        setShelves([]);
        setSelectedShelf('');
        setPositions([]);
        setSelectedPosition('');
        setLayoutLoading(false);
      })
      .catch(() => setLayoutLoading(false));
  }, [selectedWarehouse]);

  useEffect(() => {
    if (!selectedZone) {
      setShelves([]);
      setSelectedShelf('');
      setPositions([]);
      setSelectedPosition('');
      return;
    }
    const zone = zones.find(z => z.id === selectedZone);
    setShelves(zone?.shelves || []);
    setSelectedShelf('');
    setPositions([]);
    setSelectedPosition('');
  }, [selectedZone, zones]);

  useEffect(() => {
    if (!selectedShelf) {
      setPositions([]);
      setSelectedPosition('');
      return;
    }
    const shelf = shelves.find(s => s.id === selectedShelf);
    setPositions(shelf?.positions || []);
    setSelectedPosition('');
  }, [selectedShelf, shelves]);

  const handleSave = async () => {
    if (!name.trim() || !sku.trim()) {
      setError('Nombre y SKU son obligatorios');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const api = getApiClient();
      const result = await api.createProduct({
        name: name.trim(),
        sku: sku.trim(),
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
        cost_center_id: selectedCostCenter || undefined,
        tax_id: selectedTaxId || undefined,
        image_url: imageUrl || undefined,
      } as any);

      const productId = (result as any)?.id || (result as any)?.data?.id;
      if (productId && selectedPosition && selectedWarehouse) {
        await api.assignProductToPosition(selectedWarehouse, {
          product_id: productId,
          zone_id: selectedZone,
          shelf_id: selectedShelf,
          position_id: selectedPosition,
        });
      }

      router.push('/dashboard/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el producto');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventory" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Nuevo Producto</h1>
          <p className="text-sm text-muted-foreground mt-1">Crear un nuevo producto en el inventario</p>
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
                <label className="block text-xs font-medium text-foreground">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
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
                    { value: 'combo', label: 'Combo' },
                  ]}
                />
                <Select
                  label="Unidad de Medida"
                  value={unitOfMeasure}
                  onChange={(e) => setUnitOfMeasure(e.target.value)}
                  options={[
                    { value: 'un', label: 'Unidad' },
                    ...uomList.map(u => ({ value: u.code, label: u.name })),
                  ]}
                />
              </div>
              <Input label="Código de Barras" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Código de barras" />
              <Select
                label="Centro de Costo"
                value={selectedCostCenter}
                onChange={(e) => setSelectedCostCenter(e.target.value)}
                options={[
                  { value: '', label: 'Sin asignar' },
                  ...costCenters.map(cc => ({ value: cc.id, label: `${cc.code} - ${cc.name}` })),
                ]}
              />
              <Select
                label="Impuesto"
                value={selectedTaxId}
                onChange={(e) => setSelectedTaxId(e.target.value)}
                options={[
                  { value: '', label: 'Sin impuesto' },
                  ...taxes.map(t => ({ value: t.id, label: `${t.name} (${t.rate}%)` })),
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imagen del Producto</CardTitle>
            </CardHeader>
            <CardContent>
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="Producto" className="w-full h-48 object-cover rounded-lg border border-border" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-card rounded-full p-1 shadow-sm border border-border hover:bg-muted dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">{uploadingImage ? 'Subiendo...' : 'Click para subir imagen'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingImage(true);
                      try {
                        const api = getApiClient();
                        const res = await api.uploadImage(file);
                        if (res.success) setImageUrl(res.data.url);
                      } catch { toast.error('Error al subir imagen'); }
                      setUploadingImage(false);
                    }}
                  />
                </label>
              )}
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
              <CardTitle>Ubicación en Bodega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Selecciona dónde almacenar este producto en el layout de la bodega.</p>
              <Select
                label="Bodega"
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                options={[
                  { value: '', label: 'Sin asignar' },
                  ...warehouses.map(w => ({ value: w.id, label: w.name })),
                ]}
              />
              {selectedWarehouse && (
                <>
                  <Select
                    label="Zona"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    disabled={layoutLoading}
                    options={[
                      { value: '', label: 'Seleccionar zona...' },
                      ...zones.map(z => ({ value: z.id, label: `${z.name} (${z.code || ''})` })),
                    ]}
                  />
                  {selectedZone && (
                    <Select
                      label="Estante"
                      value={selectedShelf}
                      onChange={(e) => setSelectedShelf(e.target.value)}
                      options={[
                        { value: '', label: 'Seleccionar estante...' },
                        ...shelves.map(s => ({ value: s.id, label: `${s.name} (${s.code || ''})` })),
                      ]}
                    />
                  )}
                  {selectedShelf && (
                    <Select
                      label="Posición"
                      value={selectedPosition}
                      onChange={(e) => setSelectedPosition(e.target.value)}
                      options={[
                        { value: '', label: 'Sin posición...' },
                        ...positions.filter(p => !p.product).map(p => ({
                          value: p.id,
                          label: `${p.name} (${p.code || ''}) - Libre: ${p.capacity}`,
                        })),
                      ]}
                    />
                  )}
                </>
              )}
              {selectedPosition && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700 font-medium">Producto será ubicado en esta posición</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Rastrear Stock</label>
                <button
                  onClick={() => setTrackStock(!trackStock)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${trackStock ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${trackStock ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {trackStock && (
                <div className="space-y-3">
                  <Input label="Stock Mínimo" type="number" value={minStock} onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)} />
                  <Input label="Stock Máximo" type="number" value={maxStock} onChange={(e) => setMaxStock(parseFloat(e.target.value) || 0)} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Activo</label>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
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
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">SKU</p>
                  <p className="font-medium text-foreground">{sku || '—'}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Costo</span>
                <span className="font-medium">${costPrice.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Venta</span>
                <span className="font-medium">${salePrice.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margen</span>
                <span className="font-medium">
                  {costPrice > 0 ? `${(((salePrice - costPrice) / costPrice) * 100).toFixed(1)}%` : '—'}
                </span>
              </div>
              {selectedWarehouse && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Warehouse className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs text-slate-600">
                    {warehouses.find(w => w.id === selectedWarehouse)?.name}
                    {selectedZone && ` > ${zones.find(z => z.id === selectedZone)?.name}`}
                    {selectedShelf && ` > ${shelves.find(s => s.id === selectedShelf)?.name}`}
                    {selectedPosition && ` > ${positions.find(p => p.id === selectedPosition)?.name}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
