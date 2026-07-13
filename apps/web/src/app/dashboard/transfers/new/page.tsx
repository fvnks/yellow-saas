'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge } from '@yellow-erp/ui';
import { ArrowLeft, Save, Plus, Trash2, Truck, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient } from '../../../../lib/api-client';

interface WarehouseOption { id: string; name: string; code: string; }
interface ProductOption { id: string; name: string; sku: string; stock: number; }
interface TransferItem { product_id: string; quantity: number; unit_cost: number; }

export default function NewTransferPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [sourceWarehouse, setSourceWarehouse] = useState('');
  const [destWarehouse, setDestWarehouse] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<TransferItem[]>([{ product_id: '', quantity: 1, unit_cost: 0 }]);

  useEffect(() => {
    const api = getApiClient();
    api.getWarehouses().then((res: any) => {
      setWarehouses((res.data || []).map((w: any) => ({ id: w.id, name: w.name, code: w.code })));
    }).catch(() => {});
    api.getProducts({ limit: '500' }).then((res: any) => {
      setProducts((res.data || []).map((p: any) => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock || 0 })));
    }).catch(() => {});
  }, []);

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, unit_cost: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof TransferItem, value: any) => {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleSave = async () => {
    if (!sourceWarehouse || !destWarehouse) {
      setError('Selecciona bodega de origen y destino');
      return;
    }
    if (sourceWarehouse === destWarehouse) {
      setError('Las bodegas deben ser diferentes');
      return;
    }
    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (validItems.length === 0) {
      setError('Agrega al menos un producto con cantidad');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const api = getApiClient();
      await api.createStockTransfer({
        source_warehouse_id: sourceWarehouse,
        destination_warehouse_id: destWarehouse,
        notes: notes.trim() || undefined,
        items: validItems,
      });
      router.push('/dashboard/transfers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la transferencia');
      setSaving(false);
    }
  };

  const sourceProducts = sourceWarehouse
    ? products.filter(p => {
        // Filter products that have stock in the source warehouse
        return true; // For now show all, backend validates stock
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/dashboard/transfers" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Nueva Transferencia</h1>
          <p className="text-sm text-slate-500 mt-1">Mover stock entre bodegas</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto justify-center">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Crear Transferencia'}
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
              <CardTitle>Bodegas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Bodega Origen *"
                  value={sourceWarehouse}
                  onChange={(e) => { setSourceWarehouse(e.target.value); setItems([{ product_id: '', quantity: 1, unit_cost: 0 }]); }}
                  options={[{ value: '', label: 'Seleccionar origen...' }, ...warehouses.map(w => ({ value: w.id, label: `${w.code} - ${w.name}` }))]}
                />
                <Select
                  label="Bodega Destino *"
                  value={destWarehouse}
                  onChange={(e) => setDestWarehouse(e.target.value)}
                  options={[{ value: '', label: 'Seleccionar destino...' }, ...warehouses.filter(w => w.id !== sourceWarehouse).map(w => ({ value: w.id, label: `${w.code} - ${w.name}` }))]}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Motivo de la transferencia..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Productos</CardTitle>
              <Button variant="secondary" size="sm" onClick={addItem} disabled={!sourceWarehouse}>
                <Plus className="w-4 h-4 mr-1" /> Agregar
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                      <th className="text-right px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                      <th className="text-right px-6 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo Unit.</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="px-6 py-3">
                          <Select
                            value={item.product_id}
                            onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                            options={[{ value: '', label: 'Seleccionar...' }, ...sourceProducts.map(p => ({ value: p.id, label: `${p.sku} - ${p.name}` }))]}
                            className="w-full"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                            min="1"
                            className="w-20 text-right bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="number"
                            value={item.unit_cost}
                            onChange={(e) => updateItem(idx, 'unit_cost', parseFloat(e.target.value) || 0)}
                            min="0"
                            className="w-24 text-right bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-3">
                          {items.length > 1 && (
                            <button onClick={() => removeItem(idx)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <Truck className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Origen</p>
                  <p className="font-medium text-slate-900">{warehouses.find(w => w.id === sourceWarehouse)?.name || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Destino</p>
                  <p className="font-medium text-slate-900">{warehouses.find(w => w.id === destWarehouse)?.name || '—'}</p>
                </div>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between">
                <span className="text-slate-500">Productos</span>
                <span className="font-medium">{items.filter(i => i.product_id).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado</span>
                <Badge variant="neutral">Borrador</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
