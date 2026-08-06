'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@yellow-erp/ui';
import { ArrowLeft, Save, RefreshCw, Package, Warehouse } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  stock?: number;
}

interface WarehouseOption {
  id: string;
  name: string;
  code: string;
}

const ADJUSTMENT_REASONS = [
  { value: 'correction', label: 'Correccion de inventario' },
  { value: 'damaged', label: 'Producto danado' },
  { value: 'expired', label: 'Producto vencido' },
  { value: 'lost', label: 'Perdida' },
  { value: 'found', label: 'Mercaderia encontrada' },
  { value: 'theft', label: 'Robo' },
  { value: 'other', label: 'Otro' },
];

export default function NewAdjustmentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [reason, setReason] = useState('correction');
  const [notes, setNotes] = useState('');
  const [unitCost, setUnitCost] = useState<number>(0);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getProducts({ limit: '500' }),
      api.getWarehouses(),
    ]).then(([prodRes, whRes]: any[]) => {
      setProducts((prodRes.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock || 0,
      })));
      setWarehouses((whRes.data || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        code: w.code,
      })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProduct || !selectedWarehouse) {
      setCurrentStock(null);
      return;
    }
    const api = getApiClient();
    api.getProduct(selectedProduct)
      .then((data: any) => {
        const level = (data.stock_levels || []).find((sl: any) => sl.warehouse?.id === selectedWarehouse);
        setCurrentStock(level ? Number(level.quantity) : 0);
        setNewQuantity(level ? Number(level.quantity) : 0);
      })
      .catch(() => setCurrentStock(null));
  }, [selectedProduct, selectedWarehouse]);

  const difference = currentStock !== null ? newQuantity - currentStock : 0;

  const handleSave = async () => {
    if (!selectedProduct || !selectedWarehouse) {
      setError('Selecciona un producto y una bodega');
      return;
    }
    if (currentStock === null) {
      setError('No se pudo obtener el stock actual');
      return;
    }
    if (newQuantity === currentStock) {
      setError('La cantidad nueva es igual a la actual');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const api = getApiClient();
      const reasonLabel = ADJUSTMENT_REASONS.find(r => r.value === reason)?.label || reason;
      await api.createStockMovement({
        product_id: selectedProduct,
        warehouse_id: selectedWarehouse,
        type: 'adjustment',
        quantity: Math.abs(difference),
        notes: `${reasonLabel}${notes ? `: ${notes}` : ''}`,
      } as any);
      router.push('/dashboard/inventory/adjustments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el ajuste');
      setSaving(false);
    }
  };

  const selectedProductName = products.find(p => p.id === selectedProduct)?.name || '';
  const selectedWarehouseName = warehouses.find(w => w.id === selectedWarehouse)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/dashboard/inventory/adjustments" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Nuevo Ajuste de Stock</h1>
          <p className="text-sm text-muted-foreground mt-1">Ajustar inventario de un producto en una bodega</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto justify-center">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Registrar Ajuste'}
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
              <CardTitle>Producto y Bodega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Producto *"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                options={[
                  { value: '', label: 'Seleccionar producto...' },
                  ...products.map(p => ({ value: p.id, label: `${p.sku} - ${p.name}` })),
                ]}
              />
              <Select
                label="Bodega *"
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                options={[
                  { value: '', label: 'Seleccionar bodega...' },
                  ...warehouses.map(w => ({ value: w.id, label: `${w.code} - ${w.name}` })),
                ]}
              />
            </CardContent>
          </Card>

          {currentStock !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Cantidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Stock Actual</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{currentStock}</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg text-center">
                    <p className="text-[9px] font-semibold text-indigo-600 uppercase tracking-wider">Stock Nuevo</p>
                    <input
                      type="number"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                      className="text-2xl font-bold text-indigo-700 mt-1 bg-transparent text-center w-full focus:outline-none"
                    />
                  </div>
                  <div className={`p-4 rounded-lg text-center ${difference > 0 ? 'bg-emerald-50' : difference < 0 ? 'bg-rose-50' : 'bg-muted'}`}>
                    <p className={`text-[9px] font-semibold uppercase tracking-wider ${difference > 0 ? 'text-emerald-600' : difference < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                      Diferencia
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${difference > 0 ? 'text-emerald-700' : difference < 0 ? 'text-rose-700' : 'text-foreground'}`}>
                      {difference > 0 ? '+' : ''}{difference}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Motivo del Ajuste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Motivo *"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                options={ADJUSTMENT_REASONS}
              />
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                  placeholder="Descripcion adicional del ajuste..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
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
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</p>
                  <p className="font-medium text-foreground">{selectedProductName || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Warehouse className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Bodega</p>
                  <p className="font-medium text-foreground">{selectedWarehouseName || '—'}</p>
                </div>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock Actual</span>
                <span className="font-medium">{currentStock ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock Nuevo</span>
                <span className="font-medium">{currentStock !== null ? newQuantity : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diferencia</span>
                <span className={`font-bold ${difference > 0 ? 'text-emerald-600' : difference < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                  {currentStock !== null ? `${difference > 0 ? '+' : ''}${difference}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Motivo</span>
                <span className="font-medium">{ADJUSTMENT_REASONS.find(r => r.value === reason)?.label}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
